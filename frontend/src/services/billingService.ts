import { api } from './api';
import { storage } from '../utils/storage';
import { getDemoSubscription } from '../demo/demoData';

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
    if (storage.isDemoMode()) {
      return Promise.resolve(getDemoSubscription());
    }
    const response = await api.get<SubscriptionInfo>('/api/billing/subscription');
    return response.data;
  },

  /**
   * Cria sessão de checkout Stripe e retorna a URL para redirecionar
   */
  async createCheckoutSession(plan: 'SMART' | 'PRO'): Promise<CheckoutSessionResult> {
    if (storage.isDemoMode()) {
      return Promise.reject(new Error('Checkout is not available in demo mode.'));
    }
    const response = await api.post<CheckoutSessionResult>('/api/billing/checkout', { plan });
    return response.data;
  },

  /**
   * Cancela a assinatura no Stripe (efetivo ao final do período ou imediato conforme config)
   */
  async cancelSubscription(): Promise<void> {
    if (storage.isDemoMode()) {
      return Promise.reject(new Error('Billing actions are not available in demo mode.'));
    }
    await api.post('/api/billing/cancel');
  },
};
