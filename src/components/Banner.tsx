import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Info } from 'lucide-react';
import api from '../services/api';

interface Movie {
  id: number;
  title?: string;
  name?: string;
  original_name?: string;
  backdrop_path: string;
  overview: string;
  media_type?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
}

const Banner = ({ fetchUrl, onMovieClick }: { fetchUrl: string, onMovieClick: (movie: any) => void }) => {
  const [movie, setMovie] = useState<Movie | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const request = await api.get(fetchUrl);
        const results = request.data.results;
        console.log("Banner Data:", results);
        if (results && results.length > 0) {
          setMovie(results[Math.floor(Math.random() * results.length)]);
        }
      } catch (error) {
        console.error("Error fetching banner movie:", error);
      }
    }
    fetchData();
  }, [fetchUrl]);

  const truncate = (str: string, n: number) => {
    return str?.length > n ? str.substr(0, n - 1) + "..." : str;
  };

  if (!movie) return <div className="h-[70vh] w-full bg-[#141414] md:h-[56.25vw]" />;

  return (
    <header 
      className="relative h-[70vh] w-full object-contain md:h-[56.25vw]"
      style={{
        backgroundSize: "cover",
        backgroundImage: `url("https://image.tmdb.org/t/p/original/${movie?.backdrop_path}")`,
        backgroundPosition: "center center",
      }}
    >
      <div className="flex flex-col justify-center px-4 pt-20 h-full space-y-4 md:ml-8 lg:ml-12 md:pt-[15vw]">
        <h1 className="text-3xl font-bold md:text-5xl lg:text-7xl">
          {movie?.title || movie?.name || movie?.original_name}
        </h1>

        <div className="flex space-x-3">
          <button 
            onClick={() => {
              if (movie) {
                const type = movie.media_type || (movie.first_air_date ? 'tv' : 'movie');
                navigate(`/watch/${type}/${movie.id}`);
              }
            }}
            className="flex items-center gap-x-2 rounded bg-white px-5 py-1.5 text-sm font-semibold text-black transition hover:bg-[#e6e6e6] md:px-8 md:py-2.5 md:text-xl"
          >
            <Play className="h-4 w-4 fill-black text-black md:h-7 md:w-7" /> Assistir
          </button>
          <button 
            onClick={() => {
              console.log("Banner Info clicked:", movie?.title || movie?.name);
              movie && onMovieClick(movie);
            }}
            className="flex items-center gap-x-2 rounded bg-[gray]/70 px-5 py-1.5 text-sm font-semibold text-white transition hover:bg-[gray]/50 md:px-8 md:py-2.5 md:text-xl"
          >
            <Info className="h-5 w-5 md:h-8 md:w-8" /> Mais informações
          </button>
        </div>

        <p className="max-w-xs text-shadow-md text-sm md:max-w-lg md:text-lg lg:max-w-2xl lg:text-2xl">
          {truncate(movie?.overview, 120)}
        </p>
      </div>

      <div className="absolute bottom-0 h-32 w-full banner-gradient" />
    </header>
  );
};

export default Banner;
