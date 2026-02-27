import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

export function GlobalLoading() {
  const { t } = useTranslation('common');
  const { isLoading } = useAuth();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
        <p className="text-gray-700 font-medium">{t('loading')}</p>
      </div>
    </div>
  );
}
