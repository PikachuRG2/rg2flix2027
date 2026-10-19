import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import api, { requests } from '../services/api';
import catalogApi from '../services/catalogApi';
import { Search as SearchIcon, CheckCircle2, XCircle } from 'lucide-react';

// Cache dos IDs do catálogo (carregado uma vez por sessão)
let catalogCache: { movies: Set<number>; series: Set<number> } | null = null;
let catalogPromise: Promise<{ movies: Set<number>; series: Set<number> }> | null = null;

const getCatalogIds = async () => {
  if (catalogCache) return catalogCache;
  if (!catalogPromise) {
    catalogPromise = catalogApi.get('/all-ids').then(({ data }) => {
      const movies = new Set<number>();
      const series = new Set<number>();
      if (data?.status === 'success') {
        (data.results?.movies || []).forEach((i: any) => movies.add(Number(i.tmdb_id)));
        (data.results?.series || []).forEach((i: any) => series.add(Number(i.tmdb_id)));
      }
      catalogCache = { movies, series };
      return catalogCache;
    }).catch(() => ({ movies: new Set<number>(), series: new Set<number>() }));
  }
  return catalogPromise;
};

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
        // Busca metadados no TMDB e os IDs do catálogo em paralelo
        const [{ data }, catalog] = await Promise.all([
          api.get(requests.fetchSearch(query)),
          getCatalogIds(),
        ]);
        const filtered = (data.results || [])
          .filter((item: any) =>
            (item.media_type === 'movie' || item.media_type === 'tv') &&
            (item.poster_path || item.backdrop_path)
          )
          .map((item: any) => ({
            ...item,
            inCatalog: item.media_type === 'movie'
              ? catalog.movies.has(Number(item.id))
              : catalog.series.has(Number(item.id)),
          }))
          // Disponíveis no catálogo primeiro, depois por popularidade
          .sort((a: any, b: any) => (b.inCatalog ? 1 : 0) - (a.inCatalog ? 1 : 0) || (b.popularity || 0) - (a.popularity || 0));
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
                className={`relative cursor-pointer transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-600 rounded-lg p-1 group ${item.inCatalog ? '' : 'opacity-60'}`}
                onClick={() => handleMovieClick(item)}
                onKeyDown={(e) => e.key === 'Enter' && handleMovieClick(item)}
              >
                <div className="relative">
                  <img
                    src={`https://image.tmdb.org/t/p/w500/${item.poster_path || item.backdrop_path}`}
                    alt={item.title || item.name}
                    className="rounded-sm object-cover w-full h-auto"
                  />
                  <span
                    className={`absolute top-2 left-2 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ${
                      item.inCatalog
                        ? 'bg-green-600/90 text-white ring-green-300/50'
                        : 'bg-black/80 text-gray-400 ring-white/20'
                    }`}
                  >
                    {item.inCatalog ? (
                      <><CheckCircle2 className="w-3 h-3" /> No catálogo</>
                    ) : (
                      <><XCircle className="w-3 h-3" /> Fora do catálogo</>
                    )}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-300 group-focus:text-white truncate">
                  {item.title || item.name}
                  <span className="text-gray-500 ml-1">
                    ({item.media_type === 'movie' ? 'Filme' : 'Série'})
                  </span>
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
