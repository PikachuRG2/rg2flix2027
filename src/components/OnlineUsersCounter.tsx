import { useState, useEffect } from 'react';
import { Users, X } from 'lucide-react';

const OnlineUsersCounter = () => {
  const [onlineCount, setOnlineCount] = useState<number>(Math.floor(Math.random() * 50) + 10);
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    const saved = localStorage.getItem('online_counter_visible');
    return saved !== 'false';
  });

  // Atualiza o contador periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount(Math.floor(Math.random() * 50) + 10);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('online_counter_visible', 'false');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 bg-red-600 text-white px-2 py-1.5 rounded-full shadow-lg animate-pulse">
      <Users className="h-3 w-3" />
      <span className="text-xs font-semibold">{onlineCount}</span>
      <button 
        onClick={handleClose} 
        className="ml-1 hover:bg-red-700 rounded-full p-0.5 transition-colors"
        title="Fechar"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
};

export default OnlineUsersCounter;
