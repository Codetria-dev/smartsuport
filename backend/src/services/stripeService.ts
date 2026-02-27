import Stripe from 'stripe';
import { env } from '../config/env';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';

/** Helper: subscription object com campos de período (compatível com diferentes versões do SDK) */
interface SubscriptionWithPeriod {
  id: string;
  customer: string;
  status: string;
  current_period_start?: number;
  current_period_end?: number;
  cancel_at_period_end?: boolean;
  items: { data: Array<{ price: { unit_amount?: number } }> };
}

// Inicializa Stripe apenas se a chave estiver configurada
let stripe: Stripe | null = null;

if (env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(env.STRIPE_SECRET_KEY);
}

export class StripeService {
  /**
   * Constrói e valida evento do webhook (assinatura Stripe)
   */
  constructWebhookEvent(payload: Buffer | string, signature: string, secret: string): Stripe.Event {
    if (!stripe) {
      throw new AppError('Stripe não configurado', 500);
    }
    return stripe.webhooks.constructEvent(payload, signature, secret);
  }

  /**
   * Retorna a assinatura ativa do usuário (para exibir no frontend)
   */
  async getUserSubscription(userId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });
    if (!subscription) {
      return {
        hasActiveSubscription: false,
        plan: 'FREE' as const,
        status: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      };
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, planStatus: true, planEndDate: true },
    });
    return {
      hasActiveSubscription: true,
      plan: (user?.plan || subscription.plan) as 'FREE' | 'SMART' | 'PRO',
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd ?? false,
      gatewayId: subscription.gatewayId,
    };
  }

  /**
   * Cria uma sessão de checkout para upgrade de plano (SMART ou PRO)
   */
  async createCheckoutSession(userId: string, plan: 'SMART' | 'PRO'): Promise<{ sessionId: string; url: string }> {
    if (!stripe) {
      throw new AppError('Stripe não configurado', 500);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const priceId = plan === 'PRO' ? env.STRIPE_PRO_PRICE_ID : env.STRIPE_SMART_PRICE_ID;

    if (!priceId) {
      throw new AppError(`Price ID do plano ${plan} não configurado (STRIPE_${plan}_PRICE_ID)`, 500);
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.FRONTEND_URL}/billing/plans`,
      metadata: {
        userId,
        plan,
      },
    });

    return {
      sessionId: session.id,
      url: session.url || '',
    };
  }

  /**
   * Processa webhook do Stripe
   */
  async handleWebhook(event: Stripe.Event): Promise<void> {
    if (!stripe) {
      throw new AppError('Stripe não configurado', 500);
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan as 'FREE' | 'SMART' | 'PRO';

        if (userId && plan) {
          await this.activateSubscription(userId, session.subscription as string, plan);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.updateSubscription(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.cancelSubscription(subscription.id);
        break;
      }

      default:
        break;
    }
  }

  /**
   * Ativa subscription após pagamento bem-sucedido
   */
  private async activateSubscription(
    userId: string,
    subscriptionId: string,
    plan: 'FREE' | 'SMART' | 'PRO'
  ): Promise<void> {
    const raw = await stripe!.subscriptions.retrieve(subscriptionId);
    const subscription = raw as unknown as SubscriptionWithPeriod;

    await prisma.user.update({
      where: { id: userId },
      data: {
        plan,
        planStatus: 'ACTIVE',
        subscriptionId,
        planStartDate: new Date(),
        planEndDate: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : undefined,
      },
    });

    // Cria registro na tabela Subscription
    await prisma.subscription.create({
      data: {
        userId,
        plan,
        status: 'ACTIVE',
        gateway: 'STRIPE',
        gatewayId: subscriptionId,
        gatewayCustomerId: subscription.customer as string,
        currentPeriodStart: subscription.current_period_start
          ? new Date(subscription.current_period_start * 1000)
          : undefined,
        currentPeriodEnd: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : undefined,
        amount: subscription.items.data[0]?.price.unit_amount
          ? subscription.items.data[0].price.unit_amount / 100
          : undefined,
      },
    });
  }

  /**
   * Atualiza subscription (inclui cancel_at_period_end)
   */
  private async updateSubscription(subscription: Stripe.Subscription): Promise<void> {
    const sub = subscription as unknown as SubscriptionWithPeriod;
    await prisma.subscription.updateMany({
      where: { gatewayId: subscription.id },
      data: {
        status: subscription.status === 'active' ? 'ACTIVE' : 'CANCELLED',
        cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
        currentPeriodStart: sub.current_period_start
          ? new Date(sub.current_period_start * 1000)
          : undefined,
        currentPeriodEnd: sub.current_period_end
          ? new Date(sub.current_period_end * 1000)
          : undefined,
      },
    });
  }

  /**
   * Cancela subscription
   */
  private async cancelSubscription(subscriptionId: string): Promise<void> {
    const subscription = await prisma.subscription.findFirst({
      where: { gatewayId: subscriptionId },
    });

    if (subscription) {
      await prisma.user.update({
        where: { id: subscription.userId },
        data: {
          plan: 'FREE',
          planStatus: 'CANCELLED',
        },
      });

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
      });
    }
  }

  /**
   * Cancela subscription manualmente
   */
  async cancelUserSubscription(userId: string): Promise<void> {
    if (!stripe) {
      throw new AppError('Stripe não configurado', 500);
    }

    const subscription = await prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
    });

    if (!subscription || !subscription.gatewayId) {
      throw new AppError('Subscription não encontrada', 404);
    }

    await stripe.subscriptions.cancel(subscription.gatewayId);
  }
}

export const stripeService = new StripeService();
