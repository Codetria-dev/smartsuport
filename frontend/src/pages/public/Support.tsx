import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function Support() {
  const { t } = useTranslation('common');
  const [hoverEmail, setHoverEmail] = useState(false);

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

  const contactCard = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    border: '1px solid #f0ebe7',
    borderRadius: '12px',
    background: '#f9fafb',
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d64e38" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              <line x1="12" y1="9" x2="12" y2="9" />
              <line x1="16" y1="9" x2="16" y2="9" />
              <line x1="8" y1="9" x2="8" y2="9" />
            </svg>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: 0 }}>
              {t('supportPageTitle', 'Support')}
            </h1>
          </div>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
            {t('supportSubtitle', 'We are here to help you. Get in touch with us.')}
          </p>

          <div style={{ marginTop: '32px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: '0 0 16px 0' }}>
              {t('supportContact', 'Contact Information')}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={contactCard}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(214,78,56,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d64e38" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', margin: 0 }}>
                    {t('supportEmail', 'Email')}
                  </p>
                  <a
                    href="mailto:support@smartsupport.com"
                    style={{
                      fontSize: '14px',
                      color: hoverEmail ? '#b83d2a' : '#d64e38',
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={() => setHoverEmail(true)}
                    onMouseLeave={() => setHoverEmail(false)}
                  >
                    support@smartsupport.com
                  </a>
                </div>
              </div>

              <div style={contactCard}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(214,78,56,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d64e38" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', margin: 0 }}>
                    {t('supportPhone', 'Phone')}
                  </p>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                    +55 (11) 99999-8888
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '32px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: '0 0 12px 0' }}>
              {t('supportHours', 'Business Hours')}
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.7', margin: 0 }}>
              {t('supportHoursText', 'Monday to Friday: 9:00 AM — 6:00 PM (BRT)\nSaturday: 9:00 AM — 1:00 PM (BRT)')}
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
