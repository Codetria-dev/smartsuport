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

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:px-8 md:py-10">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            {t('nav:settings')}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {t('settings:managePreferences')}
          </p>
        </header>

        {isProvider && (
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('settings:profileActive')}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {t('settings:profileActiveDesc')}
                </p>
              </div>
              {loadingProfile ? (
                <div className="w-11 h-6 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
              ) : (
                <button
                  type="button"
                  role="switch"
                  aria-checked={isProfileActive}
                  disabled={updatingActive}
                  onClick={() => handleToggleProfileActive(!isProfileActive)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 ${
                    isProfileActive ? 'bg-gray-900' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
                      isProfileActive ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Link
            to="/billing/plans"
            className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div>
              <div className="font-medium text-gray-900">{t('nav:plans')}</div>
              <div className="text-sm text-gray-500 mt-0.5">
                {t('settings:planDesc')} →
              </div>
            </div>
            <span className="text-gray-400 text-lg">→</span>
          </Link>
          <Link
            to="/profile"
            className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div>
              <div className="font-medium text-gray-900">{t('nav:profile')}</div>
              <div className="text-sm text-gray-500 mt-0.5">
                {t('settings:profileDesc')} →
              </div>
            </div>
            <span className="text-gray-400 text-lg">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
