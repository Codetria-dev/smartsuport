import { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  /** Optional page title (rendered as h1 with .page-title) */
  title?: string;
  /** Max width: 'default' (72rem) | 'narrow' (32rem) | 'wide' (80rem) */
  maxWidth?: 'default' | 'narrow' | 'wide';
  /** Extra class for the wrapper */
  className?: string;
}

const maxWidthClasses = {
  default: 'max-w-6xl',
  narrow: 'max-w-xl',
  wide: 'max-w-7xl',
};

export default function PageContainer({
  children,
  title,
  maxWidth = 'default',
  className = '',
}: PageContainerProps) {
  return (
    <div className={`page-container ${maxWidthClasses[maxWidth]} ${className}`}>
      {title && <h1 className="page-title">{title}</h1>}
      {children}
    </div>
  );
}
