import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';

export interface PlanLimits {
  maxAppointmentsPerMonth: number | null; // null = ilimitado
  maxProvidersPerAccount: number | null;
  features: string[];
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  FREE: {
    maxAppointmentsPerMonth: 50,
    maxProvidersPerAccount: 1,
    features: [
      'basic_scheduling',
      'email_notifications',
      'public_booking_page',
    ],
  },
  SMART: {
    maxAppointmentsPerMonth: 200,
    maxProvidersPerAccount: 3,
    features: [
      'basic_scheduling',
      'email_notifications',
      'public_booking_page',
      'ai_auto_responder',
      'smart_scheduling',
      'analytics_basic',
    ],
  },
  PRO: {
    maxAppointmentsPerMonth: null, // Ilimitado
    maxProvidersPerAccount: null, // Ilimitado
    features: [
      'basic_scheduling',
      'email_notifications',
      'public_booking_page',
      'ai_auto_responder',
      'smart_scheduling',
      'sentiment_analysis',
      'custom_branding',
      'advanced_analytics',
      'webhook_integrations',
      'api_access',
    ],
  },
};

export class PlanService {
  /**
   * Verifica se o usuário pode realizar uma ação baseado no plano
   */
  async checkPlanLimit(
    userId: string,
    action: 'create_appointment' | 'add_provider' | 'use_ai_feature'
  ): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        planStatus: true,
        planEndDate: true,
      },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Verifica se o plano está ativo
    if (user.planStatus !== 'ACTIVE') {
      throw new AppError('Seu plano não está ativo', 403);
    }

    // Verifica se o plano expirou
    if (user.planEndDate && new Date() > user.planEndDate) {
      throw new AppError('Seu plano expirou', 403);
    }

    const limits = PLAN_LIMITS[user.plan] || PLAN_LIMITS.FREE;

    switch (action) {
      case 'create_appointment':
        if (limits.maxAppointmentsPerMonth === null) {
          return true; // Ilimitado
        }
        // Conta agendamentos do mês atual
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const appointmentsCount = await prisma.appointment.count({
          where: {
            providerId: userId,
            createdAt: {
              gte: startOfMonth,
            },
          },
        });

        return appointmentsCount < limits.maxAppointmentsPerMonth;

      case 'add_provider':
        if (limits.maxProvidersPerAccount === null) {
          return true; // Ilimitado (PRO)
        }
        // FREE e SMART têm limite; por simplicidade permitir para SMART/PRO
        return user.plan === 'PRO' || user.plan === 'SMART';

      case 'use_ai_feature':
        return limits.features.some((f) => f.startsWith('ai_') || f === 'smart_scheduling');

      default:
        return false;
    }
  }

  /**
   * Obtém informações do plano do usuário
   */
  async getUserPlan(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        planStatus: true,
        planStartDate: true,
        planEndDate: true,
        trialEndsAt: true,
        maxAppointmentsPerMonth: true,
        maxProvidersPerAccount: true,
        featuresEnabled: true,
      },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const limits = PLAN_LIMITS[user.plan] || PLAN_LIMITS.FREE;

    return {
      plan: user.plan,
      status: user.planStatus,
      startDate: user.planStartDate,
      endDate: user.planEndDate,
      trialEndsAt: user.trialEndsAt,
      limits,
      features: limits.features,
    };
  }

  /**
   * Atualiza o plano do usuário (usado por webhooks de pagamento)
   */
  async updateUserPlan(
    userId: string,
    plan: 'FREE' | 'SMART' | 'PRO',
    status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'TRIAL',
    subscriptionId?: string
  ) {
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.FREE;

    await prisma.user.update({
      where: { id: userId },
      data: {
        plan,
        planStatus: status,
        planStartDate: status === 'ACTIVE' ? new Date() : undefined,
        planEndDate: undefined, // Definido pelo Stripe webhook quando aplicável
        subscriptionId,
        maxAppointmentsPerMonth: limits.maxAppointmentsPerMonth,
        maxProvidersPerAccount: limits.maxProvidersPerAccount,
        featuresEnabled: JSON.stringify(limits.features),
      },
    });
  }
}

export const planService = new PlanService();
