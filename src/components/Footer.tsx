import { Search } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
      window.scrollTo(0, 0);
    }
  };

  return (
    <footer className="relative z-10 bg-[#141414] pt-20 pb-10 px-4 md:px-8 lg:px-12 border-t border-gray-800/50 mt-10">
      <div className="max-w-4xl mx-auto flex flex-col items-center space-y-8">
        
        {/* Lupa de Pesquisa Inferior */}
        <div className="w-full max-w-md">
          <form onSubmit={handleSearch} className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-red-600 transition-colors" />
            <input
              type="text"
              placeholder="O que você quer assistir hoje?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border-2 border-gray-700 rounded-full py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-all text-sm md:text-base outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              tabIndex={0}
            />
          </form>
        </div>

        {/* Informações e Direitos */}
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="RG2 FLIX" className="h-6 object-contain opacity-50" />
            <span className="text-gray-500 font-bold tracking-widest text-xs uppercase">RG2 FLIX</span>
          </div>
          
          <p className="text-gray-500 text-sm font-medium">
            Todos direitos reservados <span className="text-gray-400">RG2 TecNet</span> © {new Date().getFullYear()}
          </p>

          <div className="flex space-x-6 text-xs text-gray-600">
            <span className="hover:text-gray-400 cursor-pointer">Termos de Uso</span>
            <span className="hover:text-gray-400 cursor-pointer">Privacidade</span>
            <span className="hover:text-gray-400 cursor-pointer">Ajuda</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
