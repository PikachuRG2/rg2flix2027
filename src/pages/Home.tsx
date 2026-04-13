import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Tv, Film, Clapperboard, Search, Radio, Bell, User, 
  Video, Settings, Users, ShoppingCart, RefreshCcw, 
  BookOpen, MonitorPlay, History 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Atualizar relógio em tempo real
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0c1a] to-[#010101] text-white overflow-x-hidden font-sans select-none">
      {/* HEADER - IPTV SMARTERS STYLE */}
      <header className="px-4 md:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-black tracking-tighter">IPTV <span className="text-[#4da8ff]">SMARTERS</span></span>
              <div className="flex gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                <span>{formatTime(currentTime)}</span>
                <span>{formatDate(currentTime)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-5 flex-wrap justify-center">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer group focus-within:ring-2 focus-within:ring-[#4da8ff]">
            <Search className="w-4 h-4 text-gray-400 group-hover:text-white" />
            <input 
              type="text" 
              placeholder="Master Search" 
              className="bg-transparent border-none outline-none text-sm w-32 md:w-48 placeholder:text-gray-500"
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/search?q=${(e.target as HTMLInputElement).value}`)}
            />
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <IconButton icon={Radio} title="Radio" />
            <IconButton icon={Bell} title="Notifications" />
            <IconButton icon={User} title="User Profile" onClick={() => navigate('/admin')} />
            <IconButton icon={Video} title="Recordings" />
            <IconButton icon={Settings} title="Settings" />
            <IconButton icon={Users} title="Switch User" />
          </div>
        </div>
      </header>

      {/* MAIN CONTENT - GRID TILES */}
      <main className="px-4 md:px-10 py-6 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
          
          {/* LIVE TV - LARGE VERTICAL TILE */}
          <div className="md:col-span-4 lg:col-span-4 h-full min-h-[300px] md:min-h-[450px]">
            <MainTile 
              title="LIVE TV"
              icon={Tv}
              gradient="from-[#36d1dc] to-[#5b86e5]"
              onClick={() => navigate('/tv')}
              updated="1 sec ago"
            />
          </div>

          {/* RIGHT SIDE GRID */}
          <div className="md:col-span-8 lg:col-span-8 flex flex-col gap-4 md:gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <MainTile 
                title="MOVIES"
                icon={Film}
                gradient="from-[#ff416c] to-[#ff4b2b]"
                onClick={() => navigate('/movies')}
                updated="1 sec ago"
              />
              <MainTile 
                title="SERIES"
                icon={Clapperboard}
                gradient="from-[#8e2de2] to-[#4a00e0]"
                onClick={() => navigate('/series')}
                updated="1 sec ago"
              />
            </div>

            {/* SMALL TILES ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <SmallTile 
                title="LIVE WITH EPG"
                icon={BookOpen}
                onClick={() => navigate('/tv')}
              />
              <SmallTile 
                title="MULTI-SCREEN"
                icon={MonitorPlay}
                onClick={() => navigate('/tv')}
              />
              <SmallTile 
                title="CATCH UP"
                icon={History}
                onClick={() => navigate('/my-list')}
              />
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="px-4 md:px-10 py-8 mt-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-gray-400 font-medium border-t border-white/5 bg-black/20">
        <div className="flex items-center gap-2">
          <span>Expiration :</span>
          <span className="bg-white/10 px-3 py-1 rounded text-white text-xs">UNLIMITED</span>
        </div>

        <div 
          tabIndex={0}
          className="flex items-center gap-2 text-white hover:text-[#4da8ff] transition-colors cursor-pointer focus:ring-2 focus:ring-[#4da8ff] rounded-lg px-2 py-1 outline-none"
          onClick={() => navigate('/vip-plans')}
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Buy Premium Version</span>
        </div>

        <div className="flex items-center gap-2">
          <span>Logged in :</span>
          <span className="text-[#4da8ff] font-bold">{user?.email?.split('@')[0] || 'Test1'}</span>
        </div>
      </footer>
    </div>
  );
};

// COMPONENTES AUXILIARES
const IconButton = ({ icon: Icon, title, onClick }: any) => (
  <button 
    title={title}
    onClick={onClick}
    className="p-2 rounded-lg hover:bg-white/10 transition-all active:scale-90 focus:ring-2 focus:ring-[#4da8ff] outline-none"
  >
    <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
  </button>
);

const MainTile = ({ title, icon: Icon, gradient, onClick, updated }: any) => (
  <div 
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e) => e.key === 'Enter' && onClick()}
    className={`group relative flex flex-col items-center justify-center p-8 rounded-2xl bg-gradient-to-br ${gradient} cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] focus:outline-none focus:ring-4 focus:ring-white h-full overflow-hidden`}
  >
    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-125 transition-transform duration-500">
      <Icon className="w-32 h-32 -mr-10 -mt-10" />
    </div>
    
    <div className="flex flex-col items-center justify-center gap-4 relative z-10">
      <div className="p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 shadow-xl group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-12 h-12 md:w-16 md:h-16 text-white" />
      </div>
      <span className="text-2xl md:text-3xl font-black tracking-wider text-white drop-shadow-lg">{title}</span>
    </div>

    {/* Footer do Tile */}
    <div className="absolute bottom-0 left-0 right-0 bg-black/20 backdrop-blur-md py-2 px-4 flex items-center justify-between text-[10px] md:text-xs font-bold text-white/80 border-t border-white/10">
      <span>Last updated: {updated}</span>
      <RefreshCcw className="w-3 h-3 md:w-4 md:h-4 group-hover:rotate-180 transition-transform duration-500" />
    </div>
  </div>
);

const SmallTile = ({ title, icon: Icon, onClick }: any) => (
  <div 
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e) => e.key === 'Enter' && onClick()}
    className="flex items-center gap-4 p-4 md:p-6 rounded-xl bg-[#3b8e5c] hover:bg-[#4aab6e] cursor-pointer transition-all hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-white shadow-lg active:scale-95 group h-full"
  >
    <div className="p-3 bg-white/10 rounded-lg group-hover:scale-110 transition-transform duration-300">
      <Icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
    </div>
    <span className="text-sm md:text-base font-black text-white tracking-wide uppercase truncate">{title}</span>
  </div>
);

export default Home;
