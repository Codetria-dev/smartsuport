import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { planService, PlanInfo } from '../../services/planService';
import { billingService } from '../../services/billingService';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../../components/ui/Loading';

export type PlanSlug = 'FREE' | 'SMART' | 'PRO';

const PLAN_FEATURES: Record<PlanSlug, string[]> = {
  FREE: [
    '50 appointments/month',
    '1 provider',
    'Basic scheduling',
    'Email notifications',
  ],
  SMART: [
    '200 appointments/month',
    '3 providers',
    'Basic scheduling',
    'AI Auto Responder',
    'AI Smart Scheduling',
    'Basic analytics',
  ],
  PRO: [
    'Unlimited appointments',
    'Unlimited providers',
    'AI Auto Responder',
    'AI Smart Scheduling',
    'Sentiment Analysis',
    'Webhooks and API',
    'Advanced analytics',
  ],
};

const PLAN_PRICES: Record<PlanSlug, { amount: string; suffix: string }> = {
  FREE: { amount: 'R$ 0', suffix: '/mo' },
  SMART: { amount: 'R$ 49', suffix: '/mo' },
  PRO: { amount: 'R$ 99', suffix: '/mo' },
};

export default function Plans() {
  const { t } = useTranslation('billing');
  const { updateUser } = useAuth();
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<PlanSlug | 'cancel' | null>(null);
  const [stripeUnavailable, setStripeUnavailable] = useState(false);

  const loadPlanInfo = async () => {
    try {
      setLoading(true);
      setError('');
      setStripeUnavailable(false);
      const data = await planService.getUserPlan();
      setPlanInfo({
        ...data,
        features: Array.isArray(data.features) ? data.features : (data.limits?.features || []),
      });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } }; message?: string })?.response?.data?.error || (err as { message?: string })?.message || 'Erro ao carregar informações do plano';
      setError(msg);
      setPlanInfo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlanInfo();
  }, []);

  const handleUpgrade = async (plan: 'SMART' | 'PRO') => {
    try {
      setActionLoading(plan);
      setError('');
      const { url } = await billingService.createCheckoutSession(plan);
      if (url) {
        window.location.href = url;
        return;
      }
      setError('URL de checkout não retornada.');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } }; message?: string })?.response?.data?.error || (err as { message?: string })?.message;
      if (msg?.toLowerCase().includes('stripe') && msg?.toLowerCase().includes('configurado')) {
        setStripeUnavailable(true);
      } else {
        setError(msg || 'Erro ao iniciar checkout.');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm(t('cancelConfirm'))) return;
    try {
      setActionLoading('cancel');
      setError('');
      await billingService.cancelSubscription();
      await loadPlanInfo();
      const userData = await planService.getUserPlan();
      if (planInfo) {
        setPlanInfo({ ...planInfo, ...userData });
      }
      const res = await import('../../services/api').then((m) => m.api.get('/auth/me'));
      updateUser(res.data);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Erro ao cancelar assinatura.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <Loading />;

  if (error && !planInfo) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">{error}</div>
      </div>
    );
  }

  if (!planInfo) return null;

  const currentPlan = (planInfo.plan?.toUpperCase() || 'FREE') as PlanSlug;
  const isPaidPlan = currentPlan === 'SMART' || currentPlan === 'PRO';
  const startDateFormatted = planInfo.startDate ? new Date(planInfo.startDate).toLocaleDateString('pt-BR') : null;

  const renderPlanCta = (slug: PlanSlug) => {
    if (slug === currentPlan) {
      return (
        <button
          type="button"
          disabled
          className="w-full bg-gray-200 text-gray-700 rounded-lg py-2.5 text-sm font-medium cursor-not-allowed"
        >
          {t('currentPlan')}
        </button>
      );
    }
    if (slug === 'FREE') return null;
    if (slug === 'SMART') {
      return (
        <button
          type="button"
          onClick={() => handleUpgrade('SMART')}
          disabled={!!actionLoading}
          className="w-full bg-orange-500 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {actionLoading === 'SMART' ? '...' : 'Upgrade to Smart'}
        </button>
      );
    }
    if (slug === 'PRO') {
      return (
        <button
          type="button"
          onClick={() => handleUpgrade('PRO')}
          disabled={!!actionLoading}
          className="w-full bg-orange-500 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {actionLoading === 'PRO' ? '...' : 'Upgrade to Pro'}
        </button>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-gray-50 min-h-[60vh] pb-16">
      <div className="max-w-5xl mx-auto px-6 py-10 sm:py-12">
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">{t('plansAndBilling')}</h1>
        <p className="text-sm text-gray-500 mb-10">{t('subtitle')}</p>

        {stripeUnavailable && (
          <div className="mb-8 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 text-sm">
            {t('stripeNotConfigured')}
          </div>
        )}

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
            {error}
          </div>
        )}

        {/* Plano Atual - compacto (margin inferior grande para afastar os cards) */}
        <div
          className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-16 sm:mb-20"
          style={{ marginBottom: '5rem' }}
        >
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-gray-900">{t('currentPlan')}: {currentPlan}</span>
            <span className="text-sm text-gray-500">|</span>
            <span className="text-sm text-gray-600">{t('currentPlanStatus')}: {planInfo.status || 'ACTIVE'}</span>
            {startDateFormatted && (
              <>
                <span className="text-sm text-gray-500">|</span>
                <span className="text-sm text-gray-500">Since: {startDateFormatted}</span>
              </>
            )}
          </div>
          {isPaidPlan && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <button
                type="button"
                onClick={handleCancelSubscription}
                disabled={!!actionLoading}
                className="text-sm text-gray-600 hover:text-gray-900 underline disabled:opacity-50"
              >
                {actionLoading === 'cancel' ? '...' : t('cancelSubscription')}
              </button>
            </div>
          )}
        </div>

        {/* Grid de Planos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(['FREE', 'SMART', 'PRO'] as PlanSlug[]).map((slug) => (
            <div
              key={slug}
              className={`bg-white rounded-xl border shadow-sm p-8 flex flex-col justify-between ${
                slug === currentPlan ? 'border-gray-300 ring-1 ring-gray-200' : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{slug}</h3>
                {slug === currentPlan && (
                  <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">
                    Current plan
                  </span>
                )}
              </div>
              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">{PLAN_PRICES[slug].amount}</span>
                <span className="text-gray-500 text-sm ml-1">{PLAN_PRICES[slug].suffix}</span>
              </div>
              <ul className="space-y-3 text-sm text-gray-600 mb-8">
                {PLAN_FEATURES[slug].map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span>✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-2">
                {renderPlanCta(slug)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
