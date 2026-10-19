import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import { Trash2, Monitor, Smartphone, Tablet, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Devices = () => {
  const { user, sessions, removeSession, getCurrentSessionId } = useAuth();
  const currentSessionId = getCurrentSessionId();

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="h-6 w-6 text-gray-400" />;
      case 'tablet':
        return <Tablet className="h-6 w-6 text-gray-400" />;
      default:
        return <Monitor className="h-6 w-6 text-gray-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isAdmin = user?.role === 'admin' || user?.email === 'rafael2019rg@gmail.com';
  let maxDevices = 1;
  if (user?.plan === 'premium') {
    maxDevices = 3;
  } else if (user?.plan === 'basic') {
    maxDevices = 2;
  } else if (user?.plan === 'standard') {
    maxDevices = 1;
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <main className="px-4 md:px-8 lg:px-16 py-24 max-w-4xl mx-auto">
        <Link to="/" className="text-gray-400 hover:text-white transition-colors flex items-center mb-6 text-sm">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Gerenciar Dispositivos</h1>
        
        <div className="bg-[#1a1a1a] rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 mb-1">Limite de dispositivos</p>
              <p className="text-2xl font-bold">
                {sessions.length} <span className="text-gray-500">/ {isAdmin ? '∞' : maxDevices}</span>
              </p>
            </div>
            {!isAdmin && user?.plan !== 'premium' && (
              <Link to="/vip-plans" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors">
                Atualizar Plano
              </Link>
            )}
          </div>
          <p className="text-gray-500 text-sm">
            {isAdmin ? 'Você é admin, pode conectar dispositivos ilimitados.' :
             user?.plan === 'premium' ? 'Você pode conectar até 3 dispositivos simultaneamente.' :
             user?.plan === 'basic' ? 'Você pode conectar até 2 dispositivos simultaneamente.' :
             'Atualize seu plano para conectar mais dispositivos.'}
          </p>
        </div>

        <div className="space-y-4">
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <div 
                key={session.id} 
                className={`bg-[#1a1a1a] rounded-lg p-6 flex items-center justify-between transition-colors ${currentSessionId === session.id ? 'border border-green-500/50' : ''}`}
              >
                <div className="flex items-center gap-4">
                  {getDeviceIcon(session.device_type)}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{session.device_name}</h3>
                      {currentSessionId === session.id && (
                        <div className="flex items-center gap-1 text-green-500 text-sm">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Este dispositivo</span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                      Última atividade: {formatDate(session.last_active)}
                    </p>
                  </div>
                </div>
                
                {currentSessionId !== session.id && (
                  <button
                    onClick={() => removeSession(session.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-500/10"
                    title="Remover dispositivo"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">Nenhum dispositivo conectado.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Devices;
