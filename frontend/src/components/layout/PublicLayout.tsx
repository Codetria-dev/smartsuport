import Footer from './Footer';
import PublicHeader from './PublicHeader';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicHeader />
      <div className="flex-1 flex flex-col min-h-0 w-full overflow-x-hidden">
        {children}
      </div>
      <Footer />
    </div>
  );
}
