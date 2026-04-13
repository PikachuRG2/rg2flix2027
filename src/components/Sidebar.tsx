import { Home, Tv, Film, Clapperboard, Heart, Search, LogOut, ShieldCheck, User, Settings, Info, List, MonitorPlay, Ghost, Smile, PlayCircle, Star, Sparkles, TrendingUp, History, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';

interface SidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ isMobile = false, onClose }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isExpanded, setIsExpanded] = useState(isMobile);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    { icon: Search, label: 'Buscar', path: '/search' },
    { icon: Home, label: 'Início', path: '/' },
    { icon: Tv, label: 'TV Ao Vivo', path: '/tv', planRequired: true },
    { icon: MonitorPlay, label: 'TV Esportes', path: '/tv-esportes', planRequired: true },
    { icon: Film, label: 'Filmes', path: '/movies', scrollId: 'movies' },
    { icon: Clapperboard, label: 'Séries', path: '/series', scrollId: 'series' },
    { icon: Smile, label: 'Kids', path: '/kids' },
    { icon: List, label: 'Minha Lista', path: '/my-list' },
    { icon: History, label: 'Continuar Assistindo', scrollId: 'continue-watching' },
  ];

  if (user?.role === 'admin') {
    menuItems.push({ icon: ShieldCheck, label: 'Admin', path: '/admin' });
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    if (onClose) onClose();
  };

  const handleItemClick = (item: any) => {
    if (item.path) {
      navigate(item.path);
    } else if (item.scrollId) {
      const element = document.getElementById(item.scrollId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else if (location.pathname !== '/') {
        navigate('/' + '#' + item.scrollId);
      }
    }
    if (onClose) onClose();
  };

  return (
    <div 
      ref={sidebarRef}
      className={`h-full bg-black/95 z-[100] transition-all duration-300 flex flex-col items-center py-8 border-r border-white/10
        ${isMobile ? 'w-full px-6 items-start' : (isExpanded ? 'w-64 items-start px-6 fixed left-0 top-0 h-screen' : 'w-20 fixed left-0 top-0 h-screen')}
      `}
      onMouseEnter={() => !isMobile && setIsExpanded(true)}
      onMouseLeave={() => !isMobile && setIsExpanded(false)}
      onFocus={() => !isMobile && setIsExpanded(true)}
      onBlur={(e) => {
        if (!isMobile && !sidebarRef.current?.contains(e.relatedTarget as Node)) {
          setIsExpanded(false);
        }
      }}
    >
      <div className="w-full mb-10 flex items-center justify-between">
        <div className={`flex items-center gap-3 transition-all duration-300 ${isExpanded ? 'scale-100' : 'scale-75'}`}>
          <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
          {isExpanded && <span className="text-xl font-bold text-white whitespace-nowrap">RG2 FLIX</span>}
        </div>
        {isMobile && (
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      <nav className="flex-1 w-full space-y-2">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          const isAllowed = !item.planRequired || (user?.role === 'admin' || (user?.plan && user.plan !== 'standard'));

          if (!isAllowed) return null;

          return (
            <div
              key={index}
              tabIndex={0}
              className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all duration-200 outline-none
                ${isActive ? 'bg-[#E50914] text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'}
                focus:bg-white/20 focus:scale-105 group
              `}
              onClick={() => handleItemClick(item)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleItemClick(item);
                }
              }}
            >
              <item.icon className={`w-6 h-6 shrink-0 ${isActive ? 'text-white' : 'group-focus:text-white'}`} />
              {isExpanded && <span className="font-medium whitespace-nowrap">{item.label}</span>}
            </div>
          );
        })}
      </nav>

      <div className="w-full mt-auto space-y-2">
        <div
          tabIndex={0}
          className="flex items-center gap-4 p-3 rounded-lg cursor-pointer text-gray-400 hover:bg-white/10 hover:text-white transition-all duration-200 outline-none focus:bg-white/20 focus:scale-105 group"
          onClick={() => navigate('/vip-plans')}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/vip-plans')}
        >
          <Sparkles className="w-6 h-6 shrink-0 group-focus:text-white" />
          {isExpanded && <span className="font-medium whitespace-nowrap">Assinar VIP</span>}
        </div>
        
        <div
          tabIndex={0}
          className="flex items-center gap-4 p-3 rounded-lg cursor-pointer text-gray-400 hover:bg-red-600/20 hover:text-red-500 transition-all duration-200 outline-none focus:bg-red-600/40 focus:scale-105 group"
          onClick={handleLogout}
          onKeyDown={(e) => e.key === 'Enter' && handleLogout()}
        >
          <LogOut className="w-6 h-6 shrink-0 group-focus:text-red-500" />
          {isExpanded && <span className="font-medium whitespace-nowrap">Sair</span>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
