import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../ui/LanguageSwitcher';

export default function PublicHeader() {
  const navigate = useNavigate();
  const { t } = useTranslation('home');

  return (
    <header className="public-header sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200/80 flex-shrink-0">
      <nav
        className="public-header-nav max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
        aria-label="Main"
      >
        <button
          type="button"
          onClick={() => navigate('/')}
          className="public-header-brand text-xl font-bold text-slate-900 hover:text-brand transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 rounded-lg px-1"
        >
          SmartSupport
        </button>
        <div className="public-header-actions flex items-center gap-3 sm:gap-4">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-base font-medium text-slate-600 hover:text-slate-900 transition-colors py-2.5 px-4 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
          >
            {t('enter')}
          </button>
        </div>
      </nav>
    </header>
  );
}
