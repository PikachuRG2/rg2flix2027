import Sidebar from './Sidebar';
import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useState } from 'react';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const noSidebarRoutes = ['/login', '/signup', '/plans', '/player', '/watch'];
  const isPlayerRoute = location.pathname.startsWith('/watch') || location.pathname.startsWith('/player');

  if (noSidebarRoutes.some(route => location.pathname.startsWith(route))) {
    return <>{children}</>;
  }

  return (
    <div className="flex bg-[#141414] min-h-screen">
      {/* Sidebar for Desktop/TV */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[110] md:hidden">
          <div className="absolute inset-0 bg-black/80" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-black border-r border-white/10">
            <Sidebar isMobile onClose={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Mobile Menu Button */}
      {!isPlayerRoute && (
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="fixed bottom-6 right-6 z-[90] md:hidden bg-red-600 p-4 rounded-full shadow-lg active:scale-95"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>
      )}

      <div className={`flex-1 transition-all duration-300 md:ml-20 ${isPlayerRoute ? 'ml-0' : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
