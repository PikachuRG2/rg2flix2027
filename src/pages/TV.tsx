import Navbar from '../components/Navbar';
import { Maximize } from 'lucide-react';
import { useRef } from 'react';

const TV = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const toggleFullscreen = () => {
    if (iframeRef.current) {
      if (iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen();
      } else if ((iframeRef.current as any).webkitRequestFullscreen) {
        (iframeRef.current as any).webkitRequestFullscreen();
      } else if ((iframeRef.current as any).msRequestFullscreen) {
        (iframeRef.current as any).msRequestFullscreen();
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden relative">
      <Navbar />
      
      {/* Barra de Ferramentas do Player */}
      <div className="absolute top-20 right-4 z-50 flex gap-2">
        <button
          onClick={toggleFullscreen}
          className="text-white flex items-center gap-2 bg-black/70 px-4 py-2 rounded-full hover:bg-black/90 transition-colors border border-white/10"
          title="Tela Cheia"
        >
          <Maximize className="h-5 w-5" />
          <span className="hidden sm:inline text-sm font-semibold">Tela Cheia</span>
        </button>
      </div>

      <div className="flex-1 mt-16 lg:mt-20 relative">
        <iframe 
          ref={iframeRef}
          src="https://rg2tv.blogspot.com/p/grade-de-canais.html" 
          className="w-full h-full border-none"
          title="RG2 TV"
          allowFullScreen
          allow="autoplay; encrypted-media *; fullscreen *; picture-in-picture; accelerometer; clipboard-write; gyroscope; web-share"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
};

export default TV;
