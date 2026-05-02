import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/** Rotas “raiz” do app onde o botão voltar não aparece */
const HIDE_BACK_PATHS = new Set(['/dashboard']);

export function LayoutBackNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useTranslation('common');

  if (HIDE_BACK_PATHS.has(pathname)) {
    return null;
  }

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="app-back-row">
      <button type="button" onClick={handleBack} className="app-back-btn">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
        <span>{t('back')}</span>
      </button>
    </div>
  );
}
