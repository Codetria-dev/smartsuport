import { ButtonHTMLAttributes, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  isLoading = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const { t } = useTranslation('common');
  const baseStyles =
    'px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-brand text-white hover:bg-brand-dark',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  // Se className contém bg-transparent ou border, não aplicar variant padrão
  const hasCustomStyles = className.includes('bg-transparent') || className.includes('border');
  const finalClassName = hasCustomStyles
    ? `${baseStyles} ${className}`
    : `${baseStyles} ${variants[variant]} ${className}`;

  return (
    <button
      className={finalClassName}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? t('loading') : children}
    </button>
  );
}
