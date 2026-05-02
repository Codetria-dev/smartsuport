import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

export function DemoModeBanner() {
  const { isDemoMode } = useAuth();
  const { t } = useTranslation('common');
  if (!isDemoMode) return null;

  return (
    <div
      className="demo-mode-banner"
      role="status"
      style={{
        background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)',
        color: '#f1f5f9',
        fontSize: '0.8125rem',
        padding: '0.45rem 1rem',
        textAlign: 'center',
        borderBottom: '1px solid rgba(148, 163, 184, 0.25)',
        letterSpacing: '0.01em',
      }}
    >
      <span style={{ opacity: 0.95 }}>{t('demoModeBanner')}</span>
    </div>
  );
}
