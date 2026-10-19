import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const CountdownTimer = () => {
  const { getRemainingTime, user, hasTrialAccess } = useAuth();
  const [timeLeft, setTimeLeft] = useState(getRemainingTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getRemainingTime());
    }, 1000);

    return () => clearInterval(timer);
  }, [getRemainingTime]);

  // Verificar se o usuário tem plano ativo (não precisa do contador)
  const hasPaidPlan = user?.plan === 'premium' || user?.plan === 'basic' || user?.role === 'admin';

  if (hasPaidPlan) {
    return null;
  }

  if (!hasTrialAccess() || timeLeft === 0) {
    return (
      <div className="flex items-center gap-2 text-yellow-500 text-sm font-semibold">
        <span className="animate-pulse">⚠️</span>
        <Link to="/vip-plans" className="hover:text-yellow-400 underline">
          Assine para acessar TV
        </Link>
      </div>
    );
  }

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-400">TV disponível por</span>
      <span className="text-red-500 font-bold animate-pulse">
        {formatTime(timeLeft)}
      </span>
    </div>
  );
};

export default CountdownTimer;
