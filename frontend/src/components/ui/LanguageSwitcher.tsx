import { useTranslation } from 'react-i18next';

interface LanguageSwitcherProps {
  variant?: 'default' | 'light';
}

export default function LanguageSwitcher({ variant = 'default' }: LanguageSwitcherProps) {
  const { i18n } = useTranslation('common');

  const handleChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const isLight = variant === 'light';

  return (
    <div className="flex items-center gap-2">
      <span className={`hidden sm:inline ${isLight ? 'text-white/80' : 'text-gray-500'}`}>{i18n.t('language')}</span>
      <div className={`flex rounded overflow-hidden ${isLight ? 'border border-white/40 bg-white/10' : 'rounded-lg border border-gray-200 bg-white'}`}>
        <button
          type="button"
          onClick={() => handleChange('pt')}
          className={`px-3 py-1.5 font-medium transition-colors ${
            i18n.language === 'pt' || i18n.language.startsWith('pt')
              ? isLight ? 'bg-white/25 text-white' : 'bg-brand text-white'
              : isLight ? 'text-white/80 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-50'
          }`}
          aria-label="Português"
        >
          PT
        </button>
        <button
          type="button"
          onClick={() => handleChange('en')}
          className={`px-3 py-1.5 font-medium transition-colors ${
            i18n.language === 'en' || i18n.language.startsWith('en')
              ? isLight ? 'bg-white/25 text-white' : 'bg-brand text-white'
              : isLight ? 'text-white/80 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-50'
          }`}
          aria-label="English"
        >
          EN
        </button>
      </div>
    </div>
  );
}
