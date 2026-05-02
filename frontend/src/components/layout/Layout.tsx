import { Outlet } from 'react-router-dom';
import { useLayoutEffect, useRef, useState, useCallback } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { DemoModeBanner } from './DemoModeBanner';
import { LayoutBackNav } from './LayoutBackNav';

export default function Layout() {
  const layoutRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  useLayoutEffect(() => {
    const layout = layoutRef.current;
    const header = headerRef.current;
    if (!layout || !header) return;

    const syncSidebarTop = () => {
      layout.style.setProperty('--app-sidebar-offset', `${header.offsetHeight}px`);
    };

    syncSidebarTop();
    const ro = new ResizeObserver(syncSidebarTop);
    ro.observe(header);
    window.addEventListener('resize', syncSidebarTop);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', syncSidebarTop);
    };
  }, []);

  return (
    <div className="app-layout" ref={layoutRef}>
      <div className="app-layout-header" ref={headerRef}>
        <DemoModeBanner />
        <Navbar onToggleSidebar={toggleSidebar} />
      </div>
      <div className="app-body">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        <main className="app-main">
          <LayoutBackNav />
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
