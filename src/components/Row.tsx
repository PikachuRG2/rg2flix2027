import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import catalogApi from '../services/catalogApi';

interface Movie {
  id: number;
  title?: string;
  name?: string;
  original_name?: string;
  backdrop_path: string;
  poster_path: string;
  media_type?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
}

interface RowProps {
  title: string;
  fetchUrl?: string;
  movies?: Movie[]; // Nova prop opcional
  isLargeRow?: boolean;
  onMovieClick: (movie: any) => void;
  isCatalogApi?: boolean;
  catalogType?: 'movie' | 'series' | 'all';
}

const fetchPageWithRetry = async (url: string, attempts = 3): Promise<any | null> => {
  for (let i = 0; i < attempts; i++) {
    try {
      return await api.get(url);
    } catch {
      await new Promise((res) => setTimeout(res, 400 * (i + 1)));
    }
  }
  return null;
};

const Row = ({ 
  title, 
  fetchUrl, 
  movies: initialMovies, // Receber a nova prop
  isLargeRow = false, 
  onMovieClick, 
  isCatalogApi = false,
  catalogType = 'all' 
}: RowProps) => {
  const [movies, setMovies] = useState<Movie[]>(initialMovies || []); // Inicializar com initialMovies se existir
  const [loading, setLoading] = useState(!initialMovies); // Se initialMovies existir, não está carregando inicialmente
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);

  useEffect(() => {
    if (initialMovies) {
      setMovies(initialMovies);
      setLoading(false);
      return;
    }

    async function fetchData() {
      setLoading(true);
      try {
        if (isCatalogApi) {
          const endpoint = catalogType === 'movie' ? '/all-ids?type=movie' : 
                          catalogType === 'series' ? '/all-ids?type=series' : '/all-ids';
          const catalogRequest = await catalogApi.get(endpoint);
          
          if (catalogRequest.data?.status === 'success') {
            const results = catalogRequest.data.results;
            let items: any[] = [];
            
            if (catalogType === 'movie') {
              items = (results.movies || []).slice(0, 20).map((i: any) => ({ ...i, type: 'movie' }));
            } else if (catalogType === 'series') {
              items = (results.series || []).slice(0, 20).map((i: any) => ({ ...i, type: 'tv' }));
            } else {
              const movies = (results.movies || []).slice(0, 10).map((i: any) => ({ ...i, type: 'movie' }));
              const series = (results.series || []).slice(0, 10).map((i: any) => ({ ...i, type: 'tv' }));
              items = [...movies, ...series];
            }

            const detailedMovies = await Promise.all(
              items.map(async (item: any) => {
                try {
                  const response = await api.get(`/${item.type}/${item.tmdb_id}`);
                  return { ...response.data, media_type: item.type };
                } catch (e) {
                  console.error(`Error fetching details for ${item.type} ${item.tmdb_id}:`, e);
                  return null;
                }
              })
            );
            
            setMovies(detailedMovies.filter(m => m !== null));
          }
        } else if (fetchUrl) {
          // Busca 3 páginas do TMDB para encher a categoria (~60 itens), com retry por página
          const separator = fetchUrl.includes('?') ? '&' : '?';
          const pages = await Promise.all(
            [1, 2, 3].map(p => fetchPageWithRetry(`${fetchUrl}${separator}page=${p}`))
          );
          const seen = new Set<number>();
          const all: Movie[] = [];
          for (const p of pages) {
            for (const m of (p?.data?.results || [])) {
              if (m && m.id && !seen.has(m.id) && m.media_type !== 'person' && (m.backdrop_path || m.poster_path)) {
                seen.add(m.id);
                all.push(m);
              }
            }
          }
          setMovies(all);
        }
      } catch (error) {
        console.error("Error fetching row movies:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [fetchUrl, isCatalogApi, catalogType]);

  const handleClick = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
      
      // Atualizar o estado showLeft após o scroll
      setTimeout(() => {
        if (rowRef.current) {
          setShowLeft(rowRef.current.scrollLeft > 0);
        }
      }, 500);
    }
  };

  const handleScroll = () => {
    if (rowRef.current) {
      setShowLeft(rowRef.current.scrollLeft > 0);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    const focusedElement = e.target;
    if (rowRef.current && focusedElement) {
      focusedElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  };

  return (
    <div className={`space-y-0.5 md:space-y-2 px-4 md:px-8 lg:px-12 my-8 relative z-20 ${isLargeRow ? 'h-[350px] md:h-[500px]' : 'h-40 md:h-52'}`}>
      <h2 className="w-max max-w-full cursor-pointer font-display text-xl font-normal tracking-widest text-[#e5e5e5] transition duration-200 hover:text-white md:text-3xl">
        {title}
      </h2>

      <div className="group relative -ml-2">
        <div 
          className={`absolute top-0 bottom-0 left-2 z-[70] m-auto h-12 w-12 cursor-pointer transition hover:scale-125 flex items-center justify-center bg-black/30 rounded-full hover:bg-black/60 ${!showLeft && 'hidden'}`}
          onClick={() => handleClick('left')}
        >
          <ChevronLeft className="h-9 w-9 text-white" />
        </div>

        <div
          ref={rowRef}
          onScroll={handleScroll}
          onFocus={handleFocus}
          className="flex items-center space-x-2.5 overflow-x-scroll scrollbar-hide p-2"
        >
          {movies.map((movie) => (
            <div
              key={movie.id}
              tabIndex={0}
              role="button"
              aria-label={movie.title || movie.name}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onMovieClick(movie);
                }
              }}
              className={`relative cursor-pointer transition-all duration-300 ease-out hover:scale-105 hover:z-[60] focus:scale-110 focus:z-[60] focus:ring-4 focus:ring-red-600 active:scale-95 group/item outline-none rounded-xl overflow-hidden shadow-lg shadow-black/60 ring-1 ring-white/10 hover:ring-red-600/70
                ${isLargeRow 
                  ? 'h-[280px] min-w-[160px] md:h-[420px] md:min-w-[270px]' 
                  : 'h-32 min-w-[150px] md:h-44 md:min-w-[240px]'
                }`}
              onClick={() => {
                console.log("Row Image clicked:", movie.title || movie.name);
                onMovieClick(movie);
              }}
            >
              <img
                src={`https://image.tmdb.org/t/p/w500/${isLargeRow ? movie.poster_path : (movie.backdrop_path || movie.poster_path)}`}
                alt={movie.title || movie.name}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-500 group-hover/item:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent group-hover/item:from-red-950/95 group-hover/item:via-black/35 transition-colors duration-300" />

              {typeof movie.vote_average === 'number' && movie.vote_average > 0 && (
                <span className="absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-black/70 backdrop-blur-sm text-yellow-400 text-[9px] md:text-[11px] font-bold px-1.5 py-0.5 rounded-full ring-1 ring-white/20">
                  ★ {movie.vote_average.toFixed(1)}
                </span>
              )}

              <div className="absolute inset-x-0 bottom-0 px-1.5 pb-2 pt-6 text-center">
                <p className="font-title text-[10px] md:text-xs font-semibold uppercase tracking-wide leading-tight text-white card-title-shadow line-clamp-2 group-hover/item:text-yellow-300 transition-colors duration-200">
                  {movie.title || movie.name || movie.original_name}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div 
          className="absolute top-0 bottom-0 right-2 z-[70] m-auto h-12 w-12 cursor-pointer transition hover:scale-125 flex items-center justify-center bg-black/30 rounded-full hover:bg-black/60"
          onClick={() => handleClick('right')}
        >
          <ChevronRight className="h-9 w-9 text-white" />
        </div>
      </div>
    </div>
  );
};

export default Row;
