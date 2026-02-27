import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../ui/LanguageSwitcher';

export default function PublicHeader() {
  const navigate = useNavigate();
  const { t } = useTranslation('home');

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200/80 flex-shrink-0">
      <nav
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
        aria-label="Main"
      >
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-xl font-bold text-slate-900 hover:text-brand transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 rounded-lg px-1"
        >
          SmartSupport
        </button>
        <div className="flex items-center gap-3 sm:gap-4">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors py-2 px-3 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
          >
            {t('enter')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/register?role=provider')}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-brand hover:bg-brand-dark rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
          >
            {t('getStarted')}
          </button>
        </div>
      </nav>
    </header>
  );
}
