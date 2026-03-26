import Footer from './Footer';
import PublicHeader from './PublicHeader';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="public-layout-root min-h-screen flex flex-col bg-slate-50 w-full min-w-0 overflow-x-hidden">
      <PublicHeader />
      <main className="public-layout-main flex-1 flex flex-col min-h-0 w-full min-w-0">
        {children}
      </main>
      <Footer />
    </div>
  );
}
