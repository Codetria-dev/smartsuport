import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { planService, PlanInfo } from '../../services/planService';
import { billingService } from '../../services/billingService';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../../components/ui/Loading';

export type PlanSlug = 'FREE' | 'SMART' | 'PRO';

const PLAN_FEATURES: Record<PlanSlug, string[]> = {
  FREE: [
    'feature50Appointments',
    'feature1Provider',
    'featureBasicScheduling',
    'featureEmailNotifications',
  ],
  SMART: [
    'feature200Appointments',
    'feature3Providers',
    'featureBasicScheduling',
    'featureAIAutoResponder',
    'featureAISmartScheduling',
    'featureAnalyticsBasic',
  ],
  PRO: [
    'featureUnlimitedAppointmentsPro',
    'featureUnlimitedProvidersPro',
    'featureAIAutoResponder',
    'featureAISmartScheduling',
    'featureSentimentAnalysis',
    'featureWebhooksAPI',
    'featureAdvancedAnalytics',
  ],
};

const PLAN_PRICES: Record<PlanSlug, { amount: string; suffix: string }> = {
  FREE: { amount: 'R$ 0', suffix: '/mo' },
  SMART: { amount: 'R$ 49', suffix: '/mo' },
  PRO: { amount: 'R$ 99', suffix: '/mo' },
};

const PLAN_ORDER: PlanSlug[] = ['FREE', 'SMART', 'PRO'];

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
      const res = await import('../../services/api').then((m) => m.api.get('/api/auth/me'));
      updateUser(res.data);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Erro ao cancelar assinatura.');
    } finally {
      setActionLoading(null);
    }
  };

  const brandColor = '#d64e38';

  const baseInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
  };

  if (loading) return <Loading />;

  if (error && !planInfo) {
    return (
      <div style={{ minHeight: 'calc(100vh - 4rem)', background: 'linear-gradient(180deg, #fef6f2 0%, #f9fafb 100%)', padding: '40px 24px' }}>
        <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '8px', fontSize: '14px' }}>
          {error}
        </div>
      </div>
    );
  }

  if (!planInfo) return null;

  const currentPlan = (planInfo.plan?.toUpperCase() || 'FREE') as PlanSlug;
  const isPaidPlan = currentPlan === 'SMART' || currentPlan === 'PRO';
  const startDateFormatted = planInfo.startDate ? new Date(planInfo.startDate).toLocaleDateString() : null;

  const renderPlanCta = (slug: PlanSlug) => {
    const btnStyle: React.CSSProperties = {
      ...baseInputStyle,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

    if (slug === currentPlan) {
      return (
        <button type="button" disabled
          style={{ ...baseInputStyle, backgroundColor: '#f3f4f6', color: '#6b7280', cursor: 'not-allowed', border: '1px solid #e5e7eb' }}>
          {t('currentPlan')} ✓
        </button>
      );
    }
    if (slug === 'FREE') return null;
    return (
      <button
        type="button"
        onClick={() => handleUpgrade(slug)}
        disabled={!!actionLoading}
        style={{ ...baseInputStyle, backgroundColor: brandColor, color: '#fff', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)', opacity: !!actionLoading ? 0.5 : 1, cursor: !!actionLoading ? 'not-allowed' : 'pointer' }}
        onMouseEnter={(e) => { if (!actionLoading) e.currentTarget.style.backgroundColor = '#b83d2a'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = brandColor; }}
      >
        {actionLoading === slug ? '...' : t(slug === 'SMART' ? 'upgradeToSmart' : 'upgradeToPro')}
      </button>
    );
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 4rem)', background: 'linear-gradient(180deg, #fef6f2 0%, #f9fafb 100%)', paddingBottom: '64px' }}>
      <div style={{ width: '100%', maxWidth: '1024px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '4px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(214, 78, 56, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg style={{ width: '24px', height: '24px', color: brandColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', letterSpacing: '-0.025em', margin: 0 }}>{t('plansAndBilling')}</h1>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>{t('subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {stripeUnavailable && (
          <div style={{ marginBottom: '32px', padding: '16px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', borderRadius: '8px', fontSize: '14px' }}>
            {t('stripeNotConfigured')}
          </div>
        )}

        {error && (
          <div style={{ marginBottom: '32px', padding: '16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '8px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {/* Current Plan Card */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #f0ebe7', borderRadius: '12px', padding: '32px', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: '0 0 16px 0' }}>{t('currentPlan')}</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '16px' }}>
            <span style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>{t(`${currentPlan.toLowerCase()}PlanLabel` as any)}</span>
            <span style={{ padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, backgroundColor: planInfo.status === 'ACTIVE' ? '#dcfce7' : '#f3f4f6', color: planInfo.status === 'ACTIVE' ? '#166534' : '#4b5563' }}>
              {planInfo.status || 'ACTIVE'}
            </span>
            {startDateFormatted && (
              <span style={{ fontSize: '14px', color: '#6b7280' }}>{t('since')}: {startDateFormatted}</span>
            )}
          </div>
          {isPaidPlan && (
            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #f0ebe7' }}>
              <button
                type="button"
                onClick={handleCancelSubscription}
                disabled={!!actionLoading}
                style={{ fontSize: '14px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '2px', padding: '4px 0' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#dc2626'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#6b7280'; }}
              >
                {actionLoading === 'cancel' ? '...' : t('cancelSubscription')}
              </button>
            </div>
          )}
        </div>

        {/* Plans Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px' }}>
          {PLAN_ORDER.map((slug) => {
            const isCurrent = slug === currentPlan;
            const planSlug = slug.toLowerCase() as 'free' | 'smart' | 'pro';
            return (
              <div key={slug} style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                border: isCurrent ? `2px solid ${brandColor}` : '1px solid #f0ebe7',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: isCurrent ? `0 0 0 4px rgba(214, 78, 56, 0.08)` : '0 1px 3px 0 rgba(0,0,0,0.06)',
              }}>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
                      {t(`${planSlug}PlanLabel` as any)}
                    </h3>
                    {isCurrent && (
                      <span style={{ backgroundColor: 'rgba(214, 78, 56, 0.1)', color: brandColor, fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '9999px' }}>
                        {t('currentPlan')}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontSize: '30px', fontWeight: 700, color: '#111827' }}>{PLAN_PRICES[slug].amount}</span>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>{PLAN_PRICES[slug].suffix}</span>
                  </div>
                </div>

                <ul style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, margin: '0 0 32px 0', padding: 0, listStyle: 'none' }}>
                  {PLAN_FEATURES[slug].map((featureKey) => (
                    <li key={featureKey} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '14px', color: '#4b5563' }}>
                      <svg style={{ width: '16px', height: '16px', marginTop: '2px', color: brandColor, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{t(featureKey)}</span>
                    </li>
                  ))}
                </ul>

                <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
                  {renderPlanCta(slug)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
