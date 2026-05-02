import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { useToast } from '../../contexts/ToastContext';

export default function Settings() {
  const { t } = useTranslation(['common', 'nav', 'settings']);
  const { user, updateUser } = useAuth();
  const { success, error: showError } = useToast();
  const [isProfileActive, setIsProfileActive] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [updatingActive, setUpdatingActive] = useState(false);

  const role = user?.role != null ? String(user.role).toUpperCase() : '';
  const isProvider = role === 'PROVIDER' || role === 'ADMIN';

  useEffect(() => {
    if (isProvider && user) {
      setLoadingProfile(true);
      authService
        .getProfile()
        .then((profile) => {
          setIsProfileActive(profile.isProfileActive !== false);
        })
        .finally(() => setLoadingProfile(false));
    }
  }, [isProvider, user?.id]);

  const handleToggleProfileActive = async (next: boolean) => {
    if (!user || !isProvider) return;
    try {
      setUpdatingActive(true);
      await authService.updateProfile({ isProfileActive: next });
      setIsProfileActive(next);
      updateUser({ ...user, isProfileActive: next });
      success(next ? t('settings:profileActivated') : t('settings:profileDeactivated'));
    } catch (err: any) {
      showError(err.response?.data?.error || t('settings:updateError'));
    } finally {
      setUpdatingActive(false);
    }
  };

  const cardStyle = {
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06), 0 12px 24px -8px rgba(0,0,0,0.08)',
    border: '1px solid #f0ebe7',
    padding: '32px',
  };

  const pageStyle = {
    width: '100%',
    background: 'linear-gradient(to bottom, #fef6f2, #f9fafb)',
    minHeight: '60vh',
  };

  const containerStyle = {
    maxWidth: '672px',
    margin: '0 auto',
    padding: '24px 16px',
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={cardStyle}>
          <header style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d64e38" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#111827', margin: 0 }}>
                {t('nav:settings')}
              </h1>
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
              {t('settings:managePreferences')}
            </p>
          </header>

          {isProvider && (
            <div style={{ borderTop: '1px solid #f0ebe7', paddingTop: '24px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <h3 style={{ fontWeight: 500, color: '#111827', margin: 0, fontSize: '16px' }}>
                    {t('settings:profileActive')}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
                    {t('settings:profileActiveDesc')}
                  </p>
                </div>
                {loadingProfile ? (
                  <div style={{
                    width: '44px',
                    height: '24px',
                    background: '#e5e7eb',
                    borderRadius: '9999px',
                    flexShrink: 0,
                  }} />
                ) : (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isProfileActive}
                    disabled={updatingActive}
                    onClick={() => handleToggleProfileActive(!isProfileActive)}
                    style={{
                      position: 'relative',
                      display: 'inline-flex',
                      height: '24px',
                      width: '44px',
                      flexShrink: 0,
                      cursor: updatingActive ? 'not-allowed' : 'pointer',
                      borderRadius: '9999px',
                      border: '2px solid transparent',
                      background: isProfileActive ? '#d64e38' : '#e5e7eb',
                      transition: 'background 0.2s',
                      opacity: updatingActive ? 0.5 : 1,
                      padding: 0,
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        height: '20px',
                        width: '20px',
                        transform: isProfileActive ? 'translateX(20px)' : 'translateX(0)',
                        borderRadius: '50%',
                        background: '#fff',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        transition: 'transform 0.2s',
                        pointerEvents: 'none',
                      }}
                    />
                  </button>
                )}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link
              to="/billing/plans"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                textDecoration: 'none',
                transition: 'background 0.2s',
              }}
            >
              <div>
                <div style={{ fontWeight: 500, color: '#111827', fontSize: '15px' }}>{t('nav:plans')}</div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '2px' }}>
                  {t('settings:planDesc')}
                </div>
              </div>
              <span style={{ color: '#9ca3af', fontSize: '18px' }}>→</span>
            </Link>
            <Link
              to="/profile"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                textDecoration: 'none',
                transition: 'background 0.2s',
              }}
            >
              <div>
                <div style={{ fontWeight: 500, color: '#111827', fontSize: '15px' }}>{t('nav:profile')}</div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '2px' }}>
                  {t('settings:profileDesc')}
                </div>
              </div>
              <span style={{ color: '#9ca3af', fontSize: '18px' }}>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
