import { api } from './api';

export interface PlanInfo {
  plan: string;
  status: string;
  startDate?: string;
  endDate?: string;
  trialEndsAt?: string;
  limits: {
    maxAppointmentsPerMonth: number | null;
    maxProvidersPerAccount: number | null;
    features: string[];
  };
  features: string[];
}

export const planService = {
  /**
   * Obtém informações do plano do usuário
   */
  async getUserPlan(): Promise<PlanInfo> {
    const response = await api.get('/auth/me');
    const user = response.data || {};
    const planRaw = user.plan ? String(user.plan).toUpperCase() : 'FREE';
    const plan = planRaw === 'PRO' ? 'PRO' : planRaw === 'SMART' ? 'SMART' : 'FREE';

    const features =
      plan === 'PRO'
        ? [
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
          ]
        : plan === 'SMART'
          ? [
              'basic_scheduling',
              'email_notifications',
              'public_booking_page',
              'ai_auto_responder',
              'smart_scheduling',
              'analytics_basic',
              '200_appointments_month',
              '3_providers',
            ]
          : [
              'basic_scheduling',
              'email_notifications',
              'public_booking_page',
              '50_appointments_month',
              '1_provider',
            ];

    const limits = {
      maxAppointmentsPerMonth: plan === 'PRO' ? null : plan === 'SMART' ? 200 : 50,
      maxProvidersPerAccount: plan === 'PRO' ? null : plan === 'SMART' ? 3 : 1,
      features,
    };

    return {
      plan,
      status: user.planStatus || 'ACTIVE',
      startDate: user.planStartDate,
      endDate: user.planEndDate,
      trialEndsAt: user.trialEndsAt,
      limits,
      features,
    };
  },
};
