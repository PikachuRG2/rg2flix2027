import { useState, useEffect, useRef } from 'react';
import { Search, Bell, User, LogOut, Settings, X, Menu, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchToggle = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 z-50 w-full px-4 py-4 transition-all duration-500 lg:px-12 ${isScrolled ? 'bg-[#141414]' : 'bg-transparent'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 md:space-x-10">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="RG2 FLIX" className="h-8 md:h-10 object-contain" />
            <h1 className="text-2xl font-bold text-white md:text-3xl">RG2 FLIX</h1>
          </Link>
          
          {/* Menu Mobile Button */}
          <div className="relative md:hidden" ref={mobileMenuRef}>
            <button 
              className="flex items-center space-x-1 text-sm font-semibold text-white transition-colors hover:text-gray-300 focus-visible:outline-white p-1 rounded"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <span>Navegar</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showMobileMenu ? 'rotate-180' : ''}`} />
            </button>

            {showMobileMenu && (
              <div className="absolute left-0 mt-4 w-64 origin-top-left rounded bg-black/95 py-2 shadow-2xl ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-200">
                <div className="absolute -top-2 left-4 h-4 w-4 rotate-45 bg-black/95" />
                <ul className="flex flex-col border-t-2 border-white/10">
                  <li 
                    className="px-4 py-3 text-center text-sm font-semibold text-white hover:bg-white/10 transition-colors cursor-pointer focus:bg-white/20 outline-none" 
                    tabIndex={0} 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        navigate('/');
                        setShowMobileMenu(false);
                      }
                    }} 
                    onClick={() => { navigate('/'); setShowMobileMenu(false); }}
                  >
                    Início
                  </li>
                  {(user?.role === 'admin' || (user?.plan && user.plan !== 'standard')) && (
                    <>
                      <li 
                        className="px-4 py-3 text-center text-sm text-gray-300 hover:bg-white/10 transition-colors cursor-pointer focus:bg-white/20 outline-none" 
                        tabIndex={0} 
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            navigate('/tv');
                            setShowMobileMenu(false);
                          }
                        }} 
                        onClick={() => { navigate('/tv'); setShowMobileMenu(false); }}
                      >
                        TV
                      </li>
                      <li 
                        className="px-4 py-3 text-center text-sm text-gray-300 hover:bg-white/10 transition-colors cursor-pointer focus:bg-white/20 outline-none" 
                        tabIndex={0} 
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            navigate('/tv-esportes');
                            setShowMobileMenu(false);
                          }
                        }} 
                        onClick={() => { navigate('/tv-esportes'); setShowMobileMenu(false); }}
                      >
                        Tv Esportes
                      </li>
                    </>
                  )}
                  <li 
                    className="px-4 py-3 text-center text-sm text-gray-300 hover:bg-white/10 transition-colors cursor-pointer focus:bg-white/20 outline-none" 
                    tabIndex={0} 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        navigate('/');
                        setTimeout(() => document.getElementById('series')?.scrollIntoView({ behavior: 'smooth' }), 100);
                        setShowMobileMenu(false);
                      }
                    }} 
                    onClick={() => { navigate('/'); setTimeout(() => document.getElementById('series')?.scrollIntoView({ behavior: 'smooth' }), 100); setShowMobileMenu(false); }}
                  >
                    Séries
                  </li>
                  <li 
                    className="px-4 py-3 text-center text-sm text-gray-300 hover:bg-white/10 transition-colors cursor-pointer focus:bg-white/20 outline-none" 
                    tabIndex={0} 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        navigate('/');
                        setTimeout(() => document.getElementById('animes')?.scrollIntoView({ behavior: 'smooth' }), 100);
                        setShowMobileMenu(false);
                      }
                    }} 
                    onClick={() => { navigate('/'); setTimeout(() => document.getElementById('animes')?.scrollIntoView({ behavior: 'smooth' }), 100); setShowMobileMenu(false); }}
                  >
                    Animes
                  </li>
                  <li 
                    className="px-4 py-3 text-center text-sm text-gray-300 hover:bg-white/10 transition-colors cursor-pointer focus:bg-white/20 outline-none" 
                    tabIndex={0} 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        navigate('/');
                        setTimeout(() => document.getElementById('movies')?.scrollIntoView({ behavior: 'smooth' }), 100);
                        setShowMobileMenu(false);
                      }
                    }} 
                    onClick={() => { navigate('/'); setTimeout(() => document.getElementById('movies')?.scrollIntoView({ behavior: 'smooth' }), 100); setShowMobileMenu(false); }}
                  >
                    Filmes
                  </li>
                  <li 
                    className="px-4 py-3 text-center text-sm text-gray-300 hover:bg-white/10 transition-colors cursor-pointer focus:bg-white/20 outline-none" 
                    tabIndex={0} 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        navigate('/');
                        setTimeout(() => document.getElementById('trending')?.scrollIntoView({ behavior: 'smooth' }), 100);
                        setShowMobileMenu(false);
                      }
                    }} 
                    onClick={() => { navigate('/'); setTimeout(() => document.getElementById('trending')?.scrollIntoView({ behavior: 'smooth' }), 100); setShowMobileMenu(false); }}
                  >
                    Bombando
                  </li>
                  <li 
                    className="px-4 py-3 text-center text-sm text-gray-300 hover:bg-white/10 transition-colors cursor-pointer focus:bg-white/20 outline-none" 
                    tabIndex={0} 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        navigate('/my-list');
                        setShowMobileMenu(false);
                      }
                    }} 
                    onClick={() => { navigate('/my-list'); setShowMobileMenu(false); }}
                  >
                    Minha lista
                  </li>
                  <li 
                    className="px-4 py-3 text-center text-sm font-bold text-red-600 hover:bg-white/10 transition-colors cursor-pointer focus:bg-white/20 outline-none" 
                    tabIndex={0} 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        navigate('/vip-plans');
                        setShowMobileMenu(false);
                      }
                    }} 
                    onClick={() => { navigate('/vip-plans'); setShowMobileMenu(false); }}
                  >
                    Planos Vip
                  </li>
                </ul>
              </div>
            )}
          </div>

          <ul className="hidden space-x-4 md:flex">
            <li 
              className="nav-link cursor-pointer text-gray-300 hover:text-white transition outline-none focus-visible:text-white focus-visible:underline" 
              tabIndex={0} 
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate('/');
                }
              }} 
              onClick={() => navigate('/')}
            >
              Início
            </li>
            {(user?.role === 'admin' || (user?.plan && user.plan !== 'standard')) && (
              <>
                <li 
                  className="nav-link cursor-pointer text-gray-300 hover:text-white transition outline-none focus-visible:text-white focus-visible:underline" 
                  tabIndex={0} 
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      navigate('/tv');
                    }
                  }} 
                  onClick={() => navigate('/tv')}
                >
                  TV
                </li>
                <li 
                  className="nav-link cursor-pointer text-gray-300 hover:text-white transition outline-none focus-visible:text-white focus-visible:underline" 
                  tabIndex={0} 
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      navigate('/tv-esportes');
                    }
                  }} 
                  onClick={() => navigate('/tv-esportes')}
                >
                  Tv Esportes
                </li>
              </>
            )}
            <li 
              className="nav-link cursor-pointer text-gray-300 hover:text-white transition outline-none focus-visible:text-white focus-visible:underline" 
              tabIndex={0} 
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate('/');
                  setTimeout(() => document.getElementById('series')?.scrollIntoView({ behavior: 'smooth' }), 100);
                }
              }} 
              onClick={() => { navigate('/'); setTimeout(() => document.getElementById('series')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
            >
              Séries
            </li>
            <li 
              className="nav-link cursor-pointer text-gray-300 hover:text-white transition outline-none focus-visible:text-white focus-visible:underline" 
              tabIndex={0} 
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate('/');
                  setTimeout(() => document.getElementById('animes')?.scrollIntoView({ behavior: 'smooth' }), 100);
                }
              }} 
              onClick={() => { navigate('/'); setTimeout(() => document.getElementById('animes')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
            >
              Animes
            </li>
            <li 
              className="nav-link cursor-pointer text-gray-300 hover:text-white transition outline-none focus-visible:text-white focus-visible:underline" 
              tabIndex={0} 
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate('/');
                  setTimeout(() => document.getElementById('movies')?.scrollIntoView({ behavior: 'smooth' }), 100);
                }
              }} 
              onClick={() => { navigate('/'); setTimeout(() => document.getElementById('movies')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
            >
              Filmes
            </li>
            <li 
              className="nav-link cursor-pointer text-gray-300 hover:text-white transition outline-none focus-visible:text-white focus-visible:underline" 
              tabIndex={0} 
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate('/');
                  setTimeout(() => document.getElementById('trending')?.scrollIntoView({ behavior: 'smooth' }), 100);
                }
              }} 
              onClick={() => { navigate('/'); setTimeout(() => document.getElementById('trending')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
            >
              Bombando
            </li>
            <li 
              className="nav-link cursor-pointer text-gray-300 hover:text-white transition outline-none focus-visible:text-white focus-visible:underline" 
              tabIndex={0} 
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate('/my-list');
                }
              }} 
              onClick={() => navigate('/my-list')}
            >
              Minha lista
            </li>
            <li 
              className="nav-link cursor-pointer text-red-600 font-bold hover:text-red-500 transition outline-none focus-visible:text-red-400 focus-visible:underline" 
              tabIndex={0} 
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate('/vip-plans');
                }
              }} 
              onClick={() => navigate('/vip-plans')}
            >
              Planos Vip
            </li>
          </ul>
        </div>

        <div className="flex items-center space-x-4 text-sm font-light">
          <div className="flex items-center space-x-2">
            {showSearch ? (
              <div className="flex items-center border border-white bg-black/70 px-2 py-1 transition-all duration-300">
                <Search className="h-5 w-5 cursor-pointer" onClick={() => setShowSearch(false)} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Títulos, gente, gêneros"
                  className="bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 text-sm ml-2 w-40 md:w-60 outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/search?q=${searchQuery}`)}
                  autoFocus
                />
                <X 
                  className="h-5 w-5 cursor-pointer text-gray-400 hover:text-white" 
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearch(false);
                  }} 
                />
              </div>
            ) : (
              <button 
                className="focus-visible:outline-white p-1 rounded"
                onClick={() => {
                  setShowSearch(true);
                  setTimeout(() => searchInputRef.current?.focus(), 100);
                }}
              >
                <Search className="h-6 w-6 cursor-pointer" />
              </button>
            )}
          </div>

          <button className="cursor-pointer transition hover:text-gray-300 focus-visible:outline-white p-1 rounded" onClick={() => navigate('/kids')}>Infantil</button>
          <button className="focus-visible:outline-white p-1 rounded">
            <Bell className="h-6 w-6 cursor-pointer" />
          </button>

          <div className="relative" ref={userMenuRef}>
            <button 
              className="flex items-center space-x-2 cursor-pointer focus-visible:outline-white p-1 rounded"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="h-8 w-8 rounded bg-gray-600 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-3 w-48 origin-top-right rounded-md bg-black bg-opacity-95 py-1 shadow-2xl ring-1 ring-white ring-opacity-10 focus:outline-none border border-gray-800 animate-in fade-in zoom-in-95 duration-200">
                {user?.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="flex items-center px-4 py-3 text-sm text-gray-200 hover:bg-gray-800 hover:text-white transition-colors border-b border-gray-800"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="mr-3 h-4 w-4 text-red-600" /> 
                    <span className="font-semibold">Painel Admin</span>
                  </Link>
                )}
                <button 
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="flex w-full items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                >
                  <LogOut className="mr-3 h-4 w-4" /> Sair do RG2 Flix
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
