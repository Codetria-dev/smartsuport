import { api } from './api';

export interface SubscriptionInfo {
  hasActiveSubscription: boolean;
  plan: 'FREE' | 'SMART' | 'PRO';
  status: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  gatewayId?: string | null;
}

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

export const billingService = {
  /**
   * Retorna a assinatura atual do usuário
   */
  async getSubscription(): Promise<SubscriptionInfo> {
    const response = await api.get<SubscriptionInfo>('/billing/subscription');
    return response.data;
  },

  /**
   * Cria sessão de checkout Stripe e retorna a URL para redirecionar
   */
  async createCheckoutSession(plan: 'SMART' | 'PRO'): Promise<CheckoutSessionResult> {
    const response = await api.post<CheckoutSessionResult>('/billing/checkout', { plan });
    return response.data;
  },

  /**
   * Cancela a assinatura no Stripe (efetivo ao final do período ou imediato conforme config)
   */
  async cancelSubscription(): Promise<void> {
    await api.post('/billing/cancel');
  },
};
