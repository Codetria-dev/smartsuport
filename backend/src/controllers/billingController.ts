import { Request, Response } from 'express';
import Stripe from 'stripe';
import { env } from '../config/env';
import { stripeService } from '../services/stripeService';
import { asyncHandler } from '../middleware/error.middleware';
import { AppError } from '../middleware/error.middleware';

export const billingController = {
  /**
   * Cria sessão de checkout do Stripe
   */
  createCheckoutSession: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const { plan } = req.body;
    if (plan !== 'SMART' && plan !== 'PRO') {
      return res.status(400).json({ error: 'Plano inválido. Use plan: "SMART" ou "PRO".' });
    }
    const result = await stripeService.createCheckoutSession(req.user.userId, plan);
    return res.json(result);
  }),

  /**
   * Cancela subscription
   */
  cancelSubscription: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    await stripeService.cancelUserSubscription(req.user.userId);
    return res.json({ message: 'Subscription cancelada com sucesso' });
  }),

  /**
   * Retorna a assinatura atual do usuário (resumo para o frontend)
   */
  getSubscription: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }
    const subscription = await stripeService.getUserSubscription(req.user.userId);
    return res.json(subscription);
  }),

  /**
   * Webhook do Stripe (uso em app.ts com body raw). Verifica assinatura quando STRIPE_WEBHOOK_SECRET está configurado.
   */
  stripeWebhook: asyncHandler(stripeWebhookHandler),
};

/** Handler async puro do webhook (para uso com express.raw em app.ts) */
export async function stripeWebhookHandler(req: Request, res: Response): Promise<void> {
  const signature = req.headers['stripe-signature'] as string | undefined;

  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new AppError(
      'STRIPE_WEBHOOK_SECRET não configurado. O webhook não pode ser verificado.',
      500
    );
  }

  if (!signature) {
    throw new AppError('stripe-signature header ausente', 400);
  }

  const rawBody = req.body as Buffer | string;
  if (!rawBody) {
    throw new AppError('Webhook body vazio', 400);
  }

  let event: Stripe.Event;
  try {
    event = stripeService.constructWebhookEvent(
      typeof rawBody === 'string' ? Buffer.from(rawBody) : rawBody,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    throw new AppError(`Webhook signature verification failed: ${err.message}`, 400);
  }

  await stripeService.handleWebhook(event);
  res.json({ received: true });
}
