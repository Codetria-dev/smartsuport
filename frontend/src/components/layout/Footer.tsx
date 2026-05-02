import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function Footer() {
  const { t } = useTranslation('common');
  return (
    <footer style={{
      background: '#f9fafb',
      borderTop: '1px solid #e5e7eb',
      padding: '24px 0',
      marginTop: 'auto',
      flexShrink: 0,
      width: '100%',
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px', textAlign: 'center' }}>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          &copy; {new Date().getFullYear()} {t('appName')}. {t('allRightsReserved')}
        </p>
        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginTop: '8px', fontSize: '14px', color: '#6b7280' }}>
          <Link to="/terms" style={{ color: '#6b7280', textDecoration: 'none' }}>
            {t('terms')}
          </Link>
          <Link to="/privacy" style={{ color: '#6b7280', textDecoration: 'none' }}>
            {t('privacy')}
          </Link>
          <Link to="/support" style={{ color: '#6b7280', textDecoration: 'none' }}>
            {t('support')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
