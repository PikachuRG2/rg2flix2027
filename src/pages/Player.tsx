import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Server, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const Player = () => {
  const { user } = useAuth();
  const { type, id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const seasonParam = searchParams.get('s') || '1';
  const episodeParam = searchParams.get('e') || '1';

  const [loading, setLoading] = useState(true);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [movieData, setMovieData] = useState<any>(null);
  const [activeServer, setActiveServer] = useState(0);
  const [customLink, setCustomLink] = useState<string | null>(null);
  const [preloading, setPreloading] = useState(false);
  const [preloadedUrl, setPreloadedUrl] = useState<string | null>(null);

  const [showServers, setShowServers] = useState(false);
  const [showEpisodes, setShowEpisodes] = useState(false);

  const [season, setSeason] = useState(Number(seasonParam));
  const [episode, setEpisode] = useState(Number(episodeParam));

  // Sincronizar estados com parâmetros da URL
  useEffect(() => {
    setSeason(Number(seasonParam));
    setEpisode(Number(episodeParam));
    setIframeLoading(true);
  }, [seasonParam, episodeParam]);

  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [seasonsData, setSeasonsData] = useState<any[]>([]);

  const serverMenuRef = useRef<HTMLDivElement>(null);
  const episodeMenuRef = useRef<HTMLDivElement>(null);

  // fechar menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (serverMenuRef.current && !serverMenuRef.current.contains(e.target as Node)) {
        setShowServers(false);
      }
      if (episodeMenuRef.current && !episodeMenuRef.current.contains(e.target as Node)) {
        setShowEpisodes(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // fallback
  const fallbackUrls = [
    type === 'tv'
      ? `https://embedplayapi.site/embed/${id}/${season}/${episode}`
      : `https://embedplayapi.site/embed/${id}`,

    type === 'tv'
      ? `https://myembed.biz/serie/${id}/${season}/${episode}`
      : `https://myembed.biz/filme/${id}`,

    type === 'tv'
      ? `https://playerflix.ink/serie/${id}/${season}/${episode}`
      : `https://playerflix.ink/filme/${id}`,
  ];

  // servidores
  const getServers = () => {
    const playerflixUrl =
      type === 'tv'
        ? `https://playerflix.ink/pages/ajax.php?id=${id}&type=tv&season=${season}&episode=${episode}`
        : `https://playerflix.ink/pages/ajax.php?id=${id}&type=movie`;

    const myEmbedUrl =
      type === 'tv'
        ? `https://myembed.biz/serie/${id}/${season}/${episode}`
        : `https://myembed.biz/filme/${id}`;

    // Se o usuário não tiver plano ou estiver no plano padrão, e não for admin, só tem acesso ao SV FREE
    if (user?.role !== 'admin' && (!user?.plan || user?.plan === 'standard')) {
      return [
        { name: '🎬 SV FREE', url: myEmbedUrl },
      ];
    }

    let list = [
      { name: '💎 RG2 VIP', url: 'vip' },
      { name: '🔥 RG2Flix', url: playerflixUrl },
      { name: '🎬 SV FREE', url: myEmbedUrl },
    ];

    if (customLink) {
      list.unshift({ name: '⭐ Servidor Privado', url: customLink });
    }

    return list;
  };

  const servers = getServers();

  const playerUrl =
    servers[activeServer]?.url === 'vip'
      ? fallbackUrls[fallbackIndex]
      : servers[activeServer]?.url;

  // fetch
  useEffect(() => {
    async function fetchData() {
      setIframeLoading(true);

      try {
        const { data } = await supabase
          .from('custom_links')
          .select('url')
          .eq('tmdb_id', id)
          .maybeSingle();

        if (data?.url) setCustomLink(data.url);

        const { data: tmdbData } = await api.get(
          `/${type}/${id}?language=pt-BR`
        );

        setMovieData(tmdbData);

        // episódios reais
        if (type === 'tv') {
          const total = tmdbData.number_of_seasons;
          let all = [];

          for (let i = 1; i <= total; i++) {
            const { data } = await api.get(
              `/tv/${id}/season/${i}?language=pt-BR`
            );
            all.push(data);
          }

          setSeasonsData(all);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [type, id]);

  useEffect(() => {
    setFallbackIndex(0);
    setPreloadedUrl(null); // Reset pre-load ao mudar manualmente
  }, [id, season, episode, activeServer]);

  const getNextEpisodeInfo = () => {
    if (type !== 'tv') return null;
    const currentSeasonData = seasonsData.find(s => s.season_number === season);
    const hasNextEpisode = currentSeasonData?.episodes.some((e: any) => e.episode_number === episode + 1);

    if (hasNextEpisode) {
      return { s: season, e: episode + 1 };
    } else {
      const hasNextSeason = seasonsData.some(s => s.season_number === season + 1);
      if (hasNextSeason) {
        return { s: season + 1, e: 1 };
      }
    }
    return null;
  };

  const handleNextEpisode = () => {
    const next = getNextEpisodeInfo();
    if (next) {
      navigate(`/watch/tv/${id}?s=${next.s}&e=${next.e}`);
    }
  };

  // Pre-carregamento silencioso (Pula propagandas iniciais em background)
  useEffect(() => {
    if (type !== 'tv' || !seasonsData.length) return;

    const timer = setTimeout(() => {
      const next = getNextEpisodeInfo();
      if (next) {
        // Monta a URL do próximo episódio usando o mesmo servidor ativo
        let url = '';
        const server = servers[activeServer];
        
        if (server.url === 'vip') {
          url = `https://embedplayapi.site/embed/${id}/${next.s}/${next.e}`;
        } else {
          // Ajusta a URL do servidor dinamicamente
          url = server.url
            .replace(`season=${season}`, `season=${next.s}`)
            .replace(`episode=${episode}`, `episode=${next.e}`)
            .replace(`serie/${id}/${season}/${episode}`, `serie/${id}/${next.s}/${next.e}`);
        }
        
        setPreloadedUrl(url);
        console.log("Pre-carregando próximo episódio em background...");
      }
    }, 1000 * 60 * 35); // Começa a carregar após 35 minutos do episódio atual

    return () => clearTimeout(timer);
  }, [type, episode, season, seasonsData, activeServer]);

  // Salvar no histórico "Continuar Assistindo"
  useEffect(() => {
    if (!user || !movieData || !id) return;

    const saveToHistory = async () => {
      try {
        const { error } = await supabase
          .from('watch_history')
          .upsert({
            user_id: user.id,
            tmdb_id: Number(id),
            media_type: type,
            season: type === 'tv' ? season : null,
            episode: type === 'tv' ? episode : null,
            movie_data: {
              ...movieData,
              media_type: type // Garantir que o tipo esteja nos dados
            },
            last_watched_at: new Date().toISOString()
          }, {
            onConflict: 'user_id, tmdb_id'
          });

        if (error) {
          console.error("Erro ao salvar no histórico:", error.message);
          // Se a tabela não existir, podemos ignorar silenciosamente ou avisar no console
        }
      } catch (err) {
        console.error("Erro inesperado ao salvar no histórico:", err);
      }
    };

    // Salvar após 5 segundos de player aberto para evitar salvar cliques acidentais
    const timer = setTimeout(saveToHistory, 5000);
    return () => clearTimeout(timer);
  }, [user, movieData, id, season, episode, type]);

  return (
    <div className="h-screen w-screen bg-black relative">

      {/* VOLTAR */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={() => navigate(-1)}
          className="text-white flex items-center gap-2 bg-black/70 px-4 py-2 rounded-full hover:bg-black/90 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" /> <span className="hidden sm:inline">Voltar</span>
        </button>
      </div>

      {/* CONTROLES */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">

        {/* SERVIDORES */}
        <div className="relative" ref={serverMenuRef}>
          <button
            onClick={() => setShowServers(!showServers)}
            className="text-white flex items-center gap-2 bg-black/70 px-4 py-2 rounded-full hover:bg-black/90 transition-colors"
          >
            <Server className="h-5 w-5" /> <span className="text-sm font-semibold">Servidores</span>
          </button>

          {showServers && (
            <div className="absolute right-0 bg-black/95 border border-white/10 mt-2 rounded shadow-2xl min-w-[160px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {servers.map((s, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setIframeLoading(true);
                    setActiveServer(i);
                    setShowServers(false);
                  }}
                  className={`block w-full text-left px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors ${
                    i === activeServer ? 'bg-red-600 hover:bg-red-700 font-bold' : ''
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* EPISÓDIOS */}
        {type === 'tv' && (
          <div className="relative" ref={episodeMenuRef}>
            <button
              onClick={() => setShowEpisodes(!showEpisodes)}
              className="text-white bg-black/70 px-4 py-2 rounded-full hover:bg-black/90 transition-colors text-sm font-semibold"
            >
              Episódios
            </button>

            {showEpisodes && (
              <div className="absolute right-0 bg-black/95 border border-white/10 mt-2 rounded shadow-2xl w-[80vw] sm:w-[400px] max-h-[70vh] overflow-y-auto p-4 animate-in fade-in zoom-in-95 duration-200">
                {seasonsData.map((s) => (
                  <div key={s.season_number} className="mb-4 last:mb-0">
                    <div className="text-white font-bold mb-2 border-b border-white/10 pb-1">
                      Temporada {s.season_number}
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {s.episodes.map((ep: any) => (
                        <button
                          key={ep.episode_number}
                          onClick={() => {
                            setSeason(s.season_number);
                            setEpisode(ep.episode_number);
                            setIframeLoading(true);
                            setShowEpisodes(false);
                          }}
                          className={`flex items-center justify-center rounded transition-colors aspect-square text-sm ${
                            season === s.season_number &&
                            episode === ep.episode_number
                              ? 'bg-red-600 text-white font-bold'
                              : 'bg-white/10 text-gray-300 hover:bg-white/20'
                          }`}
                        >
                          {ep.episode_number}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BOTÃO PRÓXIMO */}
        {type === 'tv' && (
          <button
            onClick={handleNextEpisode}
            className="text-white bg-black/70 px-4 py-2 rounded-full hover:bg-black/90 transition-colors font-semibold flex items-center gap-2"
          >
            Próximo
          </button>
        )}

      </div>

      {/* LOADING */}
      {(loading || iframeLoading) && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          Carregando...
        </div>
      )}

      {/* PLAYER ATIVO */}
      {!loading && playerUrl && (
        <iframe
          key={playerUrl}
          src={playerUrl}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; encrypted-media *; fullscreen *; picture-in-picture; accelerometer; clipboard-write; gyroscope; web-share"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setIframeLoading(false)}
          onError={() => {
            if (servers[activeServer]?.url === 'vip') {
              if (fallbackIndex < fallbackUrls.length - 1) {
                setFallbackIndex(prev => prev + 1);
              }
            }
          }}
        />
      )}

      {/* PLAYER ESCONDIDO (PRE-LOAD PARA PULAR ADS) */}
      {preloadedUrl && (
        <div className="fixed inset-0 w-0 h-0 overflow-hidden pointer-events-none opacity-0">
          <iframe
            src={preloadedUrl}
            title="Preload"
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; encrypted-media *; fullscreen *; picture-in-picture"
            referrerPolicy="origin"
          />
        </div>
      )}

      {/* INDICADOR DE PRE-LOAD (OPCIONAL) */}
      {preloadedUrl && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-[10px] text-gray-400">
          Próximo episódio pré-carregado (Sem propagandas)
        </div>
      )}

      {/* INFO (REMOVIDO DURANTE PLAY) */}
      {!loading && movieData && iframeLoading && (
        <div className="absolute bottom-10 left-10 text-white">
          <h1 className="text-3xl font-bold">
            {movieData.title || movieData.name}
          </h1>
          <p className="text-gray-400 text-sm max-w-md">
            {movieData.overview}
          </p>
        </div>
      )}

    </div>
  );
};

export default Player;
