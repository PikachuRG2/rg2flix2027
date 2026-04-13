import React from 'react';
import { ArrowLeft, MessageCircle, Mail, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VipPlans = () => {
  const navigate = useNavigate();

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/5599984458400', '_blank');
  };

  const advantages = [
    'Acesso a conteúdos exclusivos em 4K Ultra HD',
    'Sem anúncios em nenhum filme ou série',
    'Acesso antecipado a novos lançamentos',
    'Suporte prioritário 24/7 via WhatsApp',
    'Acesso ao Servidor VIP exclusivo com maior estabilidade',
    'Possibilidade de baixar conteúdos para assistir offline',
    'Perfis personalizados para toda a família'
  ];

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full px-4 py-4 bg-[#141414]/90 backdrop-blur-sm lg:px-12 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 rounded-lg px-2"
          tabIndex={0}
        >
          <ArrowLeft className="h-6 w-6" />
          <span>Voltar</span>
        </button>
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="RG2 FLIX" className="h-8 object-contain" />
          <h1 className="text-xl font-bold">RG2 FLIX VIP</h1>
        </div>
        <div className="w-20" /> {/* Spacer */}
      </header>

      <main className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <h2 className="text-4xl md:text-5xl font-extrabold text-red-600 mb-4">Vantagens Planos VIP</h2>
          <p className="text-xl text-gray-400">Eleve sua experiência de entretenimento ao próximo nível.</p>
        </div>

        <div className="grid gap-6 mb-12">
          {advantages.map((adv, index) => (
            <div 
              key={index} 
              className="flex items-center gap-4 bg-white/5 p-4 rounded-lg border border-white/10 hover:border-red-600/50 transition-colors animate-in fade-in slide-in-from-left-4 duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CheckCircle2 className="h-6 w-6 text-red-600 shrink-0" />
              <span className="text-lg text-gray-200">{adv}</span>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-red-900/20 to-black p-8 rounded-2xl border border-red-600/30 text-center animate-in fade-in zoom-in duration-700">
          <h3 className="text-2xl font-bold mb-6">Ficou interessado? Entre em contato agora!</h3>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleWhatsAppClick}
              className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-bold text-xl transition-all hover:scale-105 shadow-lg shadow-green-900/20 focus:outline-none focus:ring-4 focus:ring-white"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleWhatsAppClick()}
            >
              <MessageCircle className="h-6 w-6" />
              Chamar no WhatsApp
            </button>

            <div className="flex items-center gap-3 bg-gray-800/50 text-gray-400 px-8 py-4 rounded-full font-bold text-lg border border-gray-700 cursor-default select-none">
              <Mail className="h-6 w-6" />
              rafael2019rg@gmail.com
            </div>
          </div>
          
          <p className="mt-8 text-sm text-gray-500">
            * O e-mail acima é apenas para referência. Para suporte rápido, utilize o WhatsApp.
          </p>
        </div>
      </main>
    </div>
  );
};

export default VipPlans;
