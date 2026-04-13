import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import api, { requests } from '../services/api';
import { Search as SearchIcon } from 'lucide-react';

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [searchInput, setSearchInput] = useState(query);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(requests.fetchSearch(query));
        const filtered = data.results.filter((item: any) => 
          (item.media_type === 'movie' || item.media_type === 'tv') && 
          (item.poster_path || item.backdrop_path)
        );
        setResults(filtered);
      } catch (error) {
        console.error("Erro na busca:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const handleMovieClick = (movie: any) => {
    setSelectedMovie(movie);
    setShowModal(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#141414]">
      <main className="pt-24 px-4 lg:px-12">
        <div className="mb-12">
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <input
              ref={inputRef}
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="O que você quer assistir hoje?"
              className="w-full bg-white/10 border-2 border-transparent focus:border-red-600 rounded-full py-4 px-14 text-xl outline-none transition-all"
              tabIndex={0}
            />
            <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            <button 
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-600 px-6 py-2 rounded-full font-bold hover:bg-red-700 transition-colors focus:ring-2 focus:ring-white outline-none"
              tabIndex={0}
            >
              BUSCAR
            </button>
          </form>
        </div>

        {query && (
          <h2 className="text-xl font-semibold text-gray-400 mb-8">
            Resultados para: <span className="text-white italic">"{query}"</span>
          </h2>
        )}

        {loading ? (
          <div className="flex justify-center pt-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {results.map((item) => (
              <div 
                key={item.id}
                tabIndex={0}
                className="relative cursor-pointer transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-600 rounded-lg p-1 group"
                onClick={() => handleMovieClick(item)}
                onKeyDown={(e) => e.key === 'Enter' && handleMovieClick(item)}
              >
                <img
                  src={`https://image.tmdb.org/t/p/w500/${item.poster_path || item.backdrop_path}`}
                  alt={item.title || item.name}
                  className="rounded-sm object-cover w-full h-auto"
                />
                <div className="mt-2 text-sm text-gray-300 group-focus:text-white truncate">
                  {item.title || item.name}
                </div>
              </div>
            ))}
          </div>
        ) : query ? (
          <div className="text-center pt-20">
            <p className="text-gray-400 text-lg">Nenhum resultado encontrado para sua busca.</p>
          </div>
        ) : (
          <div className="text-center pt-20 opacity-50">
            <SearchIcon className="w-20 h-20 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 text-lg">Digite algo para começar a buscar.</p>
          </div>
        )}
      </main>

      {showModal && (
        <Modal 
          movie={selectedMovie} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </div>
  );
};

export default Search;
