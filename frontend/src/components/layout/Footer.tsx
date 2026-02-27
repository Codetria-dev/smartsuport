import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation('common');
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-6 mt-20 flex-shrink-0">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} {t('appName')}. {t('allRightsReserved')}
        </p>
        <div className="flex gap-6 justify-center mt-2 text-gray-500 text-sm">
          <a href="#" className="hover:text-gray-900 transition-colors">{t('terms')}</a>
          <a href="#" className="hover:text-gray-900 transition-colors">{t('privacy')}</a>
          <a href="#" className="hover:text-gray-900 transition-colors">{t('support')}</a>
        </div>
      </div>
    </footer>
  );
}
