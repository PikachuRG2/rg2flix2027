import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Play, Plus, ThumbsUp, Check } from 'lucide-react';
import api from '../services/api';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface Movie {
  id: number;
  title?: string;
  name?: string;
  original_name?: string;
  backdrop_path: string;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  media_type?: string;
  poster_path?: string;
}

interface ModalProps {
  movie: Movie | null;
  onClose: () => void;
}

const Modal = ({ movie, onClose }: ModalProps) => {
  const [trailer, setTrailer] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isInList, setIsInList] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!movie || !user) return;

    const checkStatus = async () => {
      // Verificar se está curtido
      const { data: likeData } = await supabase
        .from('likes')
        .select('*')
        .eq('user_id', user.id)
        .eq('movie_id', movie.id)
        .maybeSingle();
      
      setIsLiked(!!likeData);

      // Verificar se está na lista
      const { data: listData } = await supabase
        .from('my_list')
        .select('*')
        .eq('user_id', user.id)
        .eq('movie_id', movie.id)
        .maybeSingle();
      
      setIsInList(!!listData);
    };

    checkStatus();
  }, [movie, user]);

  const handleLike = async () => {
    if (!user || !movie) {
      alert("Você precisa estar logado para curtir.");
      return;
    }

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('movie_id', movie.id);
        
        if (error) throw error;
        setIsLiked(false);
      } else {
        const { error } = await supabase
          .from('likes')
          .insert({ user_id: user.id, movie_id: movie.id });
        
        if (error) throw error;
        setIsLiked(true);
      }
    } catch (error: any) {
      console.error("Erro ao processar like:", error.message);
      alert(`Erro ao salvar curtida: ${error.message}. Verifique se a tabela 'likes' existe com as colunas 'user_id' e 'movie_id'.`);
    }
  };

  const handleAddToList = async () => {
    if (!user || !movie) {
      alert("Você precisa estar logado para adicionar à lista.");
      return;
    }

    try {
      if (isInList) {
        const { error } = await supabase
          .from('my_list')
          .delete()
          .eq('user_id', user.id)
          .eq('movie_id', movie.id);
        
        if (error) throw error;
        setIsInList(false);
      } else {
        const type = movie.media_type || (movie.first_air_date ? 'tv' : 'movie');
        const { error } = await supabase
          .from('my_list')
          .insert({ 
            user_id: user.id, 
            movie_id: movie.id,
            movie_data: {
              ...movie,
              media_type: type
            }
          });
        
        if (error) throw error;
        setIsInList(true);
      }
    } catch (error: any) {
      console.error("Erro ao processar lista:", error.message);
      alert(`Erro ao salvar na lista: ${error.message}. Verifique se a tabela 'my_list' existe com as colunas 'user_id', 'movie_id' e 'movie_data' (JSONB).`);
    }
  };

  useEffect(() => {
    if (!movie) return;

    async function fetchVideo() {
      if (!movie) return;
      setLoading(true);
      try {
        const isTv = movie.media_type === 'tv' || movie.first_air_date;
        const url = isTv ? `/tv/${movie.id}/videos` : `/movie/${movie.id}/videos`;
        const { data } = await api.get(url);
        
        const trailerVideo = data.results.find((v: any) => v.type === 'Trailer' || v.type === 'Teaser');
        if (trailerVideo) {
          setTrailer(trailerVideo.key);
        } else {
          setTrailer('');
        }
      } catch (error) {
        console.error("Error fetching trailer:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchVideo();
  }, [movie]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Backspace') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!movie) return null;

  return (
    <div 
      className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-black/80 sm:px-4 sm:py-10 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl overflow-hidden rounded-t-2xl sm:rounded-lg bg-[#181818] shadow-2xl mt-auto sm:mb-auto h-[90vh] sm:h-auto overflow-y-auto outline-none"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          autoFocus
          className="absolute right-4 top-4 z-50 rounded-full bg-[#181818]/80 p-2 transition hover:bg-[#242424] focus-visible:outline-white"
        >
          <X className="h-6 w-6 text-white" />
        </button>

        {/* Video Player or Placeholder */}
        <div className="relative aspect-video w-full bg-black">
          {trailer ? (
            <iframe
              src={`https://www.youtube.com/embed/${trailer}?autoplay=1&mute=0&controls=0&rel=0`}
              title="Trailer"
              className="h-full w-full border-none"
              allowFullScreen
              allow="autoplay; encrypted-media *; fullscreen *; picture-in-picture; accelerometer; clipboard-write; gyroscope; web-share"
            ></iframe>
          ) : (
            <div 
              className="h-full w-full bg-cover bg-center flex items-center justify-center"
              style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original/${movie.backdrop_path})` }}
            >
              {!loading && <p className="text-sm sm:text-xl font-bold bg-black/50 p-4 rounded text-white">Trailer não disponível</p>}
              {loading && <p className="text-xl text-white">Carregando...</p>}
            </div>
          )}
          <div className="absolute bottom-0 h-24 w-full bg-gradient-to-t from-[#181818] to-transparent" />
        </div>

        {/* Info */}
        <div className="p-6 sm:p-8 lg:p-12 text-white">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => {
                  if (movie) {
                    const type = movie.media_type || (movie.first_air_date ? 'tv' : 'movie');
                    const continueInfo = (movie as any).continue_watching;
                    
                    if (type === 'tv' && continueInfo) {
                      navigate(`/watch/tv/${movie.id}?s=${continueInfo.season}&e=${continueInfo.episode}`);
                    } else {
                      navigate(`/watch/${type}/${movie.id}`);
                    }
                    onClose();
                  }
                }}
                className="flex items-center gap-x-2 rounded bg-white px-5 py-1.5 text-sm sm:px-8 sm:py-2.5 sm:text-xl font-bold text-black transition hover:bg-[#e6e6e6]"
              >
                <Play className="h-5 w-5 sm:h-7 sm:w-7 fill-black text-black" />
                {(movie as any).continue_watching ? 'Continuar' : 'Assistir'}
              </button>
              <button 
                onClick={handleAddToList}
                className={`rounded-full border-2 p-1.5 sm:p-2 transition ${isInList ? 'border-green-500 bg-green-500/20' : 'border-gray-500 hover:border-white'}`}
                title={isInList ? "Remover da Minha Lista" : "Adicionar à Minha Lista"}
              >
                {isInList ? <Check className="h-4 w-4 sm:h-6 sm:w-6 text-green-500" /> : <Plus className="h-4 w-4 sm:h-6 sm:w-6" />}
              </button>
              <button 
                onClick={handleLike}
                className={`rounded-full border-2 p-1.5 sm:p-2 transition ${isLiked ? 'border-red-600 bg-red-600/20' : 'border-gray-500 hover:border-white'}`}
                title={isLiked ? "Descurtir" : "Curtir"}
              >
                <ThumbsUp className={`h-4 w-4 sm:h-6 sm:w-6 ${isLiked ? 'text-red-600 fill-red-600' : ''}`} />
              </button>
            </div>

            {(movie as any).continue_watching && movie.first_air_date && (
              <p className="text-red-600 font-bold text-sm sm:text-base">
                Você parou na Temporada {(movie as any).continue_watching.season}, Episódio {(movie as any).continue_watching.episode}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center space-x-2 text-sm font-semibold text-green-400">
                <span>{movie.vote_average ? (movie.vote_average * 10).toFixed(0) : '0'}% relevante</span>
                <span className="text-gray-400 border border-gray-400 px-1 text-[10px]">
                  {movie.release_date || movie.first_air_date || 'N/A'}
                </span>
                <span className="text-gray-400 border border-gray-400 px-1 text-[10px]">HD</span>
              </div>
              <h1 className="text-2xl font-bold md:text-4xl">
                {movie.title || movie.name || movie.original_name}
              </h1>
              <p className="text-sm sm:text-lg text-gray-300 leading-relaxed">
                {movie.overview}
              </p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <span className="text-gray-500">Gêneros:</span>
                <span className="ml-2 text-white">Indisponível</span>
              </div>
              <div>
                <span className="text-gray-500">Este título é:</span>
                <span className="ml-2 text-white">Emocionante, Suspense</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
