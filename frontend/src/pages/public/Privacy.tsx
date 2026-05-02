import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function Privacy() {
  const { t } = useTranslation('common');

  const pageStyle = {
    minHeight: '60vh',
    background: 'linear-gradient(to bottom, #fef6f2, #f9fafb)',
    padding: '48px 24px',
  };

  const containerStyle = {
    maxWidth: '720px',
    margin: '0 auto',
  };

  const cardStyle = {
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #f0ebe7',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06), 0 12px 24px -8px rgba(0,0,0,0.08)',
    padding: '40px',
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d64e38" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: 0 }}>
              {t('privacyPageTitle', 'Privacy Policy')}
            </h1>
          </div>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
            {t('privacySubtitle', 'Last updated: May 2026')}
          </p>

          <div style={{ marginTop: '32px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: '0 0 8px 0' }}>
              1. {t('privacyDataCollection', 'Data We Collect')}
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.7', margin: 0 }}>
              {t('privacyDataCollectionText', 'We collect information you provide directly, such as your name, email address, phone number, and professional details. We also collect appointment data to facilitate scheduling between professionals and clients.')}
            </p>
          </div>

          <div style={{ marginTop: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: '0 0 8px 0' }}>
              2. {t('privacyUsage', 'How We Use Your Data')}
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.7', margin: 0 }}>
              {t('privacyUsageText', 'Your data is used to provide and improve our scheduling services, send appointment notifications, process payments, and communicate with you about your account and our platform.')}
            </p>
          </div>

          <div style={{ marginTop: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: '0 0 8px 0' }}>
              3. {t('privacySharing', 'Data Sharing')}
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.7', margin: 0 }}>
              {t('privacySharingText', 'We do not sell your personal data. Information is shared only with service providers essential to platform operations (hosting, payments, notifications) and as required by law.')}
            </p>
          </div>

          <div style={{ marginTop: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: '0 0 8px 0' }}>
              4. {t('privacyRights', 'Your Rights')}
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.7', margin: 0 }}>
              {t('privacyRightsText', 'You have the right to access, correct, or delete your personal data at any time. You can manage your data through your account settings or by contacting our support team.')}
            </p>
          </div>

          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f0ebe7', textAlign: 'center' }}>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                color: '#6b7280',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t('backToHome')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
