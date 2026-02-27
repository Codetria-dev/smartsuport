import { useTranslation } from 'react-i18next';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  message?: string;
}

export default function Loading({ 
  size = 'md', 
  fullScreen = false,
  message 
}: LoadingProps) {
  const { t } = useTranslation('common');
  const displayMessage = message ?? t('loading');
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const containerClass = fullScreen
    ? 'min-h-screen flex items-center justify-center'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-4">
        <div
          className={`animate-spin rounded-full border-b-2 border-brand ${sizeClasses[size]}`}
        ></div>
        {displayMessage && <p className="text-gray-700 font-medium">{displayMessage}</p>}
      </div>
    </div>
  );
}
