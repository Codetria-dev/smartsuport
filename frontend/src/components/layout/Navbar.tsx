import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../ui/LanguageSwitcher';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation(['common', 'auth']);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="app-navbar">
      <div className="app-navbar-inner">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          {/* Hamburger button - visível apenas em mobile */}
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="sidebar-toggle-btn"
              aria-label={t('common:menu')}
            >
              <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="app-navbar-brand"
            aria-label={t('common:appName')}
          >
            <span className="app-navbar-brand-smart">Smart</span>
            <span className="app-navbar-brand-support">Support</span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          {user && (
            <>
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-600 font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={handleLogout}
                  className="px-3 sm:px-5 py-2.5 text-sm sm:text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  {t('auth:logout')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
