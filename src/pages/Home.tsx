import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Banner from '../components/Banner';
import Row from '../components/Row';
import Modal from '../components/Modal';
import Footer from '../components/Footer';
import { requests } from '../services/api';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Tv, Film, Clapperboard, Smile, Search, MonitorPlay, List, History } from 'lucide-react';

const Home = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [watchHistory, setWatchHistory] = useState<any[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      try {
        const historyRef = collection(db, 'watch_history');
        const q = query(
          historyRef,
          where('user_id', '==', user.id),
          orderBy('last_watched_at', 'desc'),
          limit(20)
        );

        const querySnapshot = await getDocs(q);
        const movies = querySnapshot.docs.map(doc => {
          const item = doc.data();
          return {
            ...item.movie_data,
            continue_watching: {
              season: item.season,
              episode: item.episode
            }
          };
        });
        setWatchHistory(movies);
      } catch (error) {
        console.error('Erro ao buscar histórico:', error);
      }
    };

    fetchHistory();
  }, [user]);

  const handleMovieClick = (movie: any) => {
    setSelectedMovie(movie);
    setShowModal(true);
  };

  return (
    <div className={`relative min-h-screen bg-[#141414] ${showModal && 'overflow-hidden'}`}>
      <main className="relative pb-24 lg:space-y-24 z-10">
        <Banner fetchUrl={requests.fetchNetflixOriginals} onMovieClick={handleMovieClick} />
        
        {/* Quick Access Tiles - mesmos atalhos da Sidebar */}
        <div className="px-4 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <button 
            tabIndex={0}
            onClick={() => navigate('/search')}
            className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl hover:scale-105 transition-transform focus:outline-none focus:ring-4 focus:ring-white group"
          >
            <Search className="w-12 h-12 mb-2 group-focus:scale-110 transition-transform" />
            <span className="font-bold text-lg">BUSCAR</span>
          </button>
          <button 
            tabIndex={0}
            onClick={() => navigate('/tv')}
            className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl hover:scale-105 transition-transform focus:outline-none focus:ring-4 focus:ring-white group"
          >
            <Tv className="w-12 h-12 mb-2 group-focus:scale-110 transition-transform" />
            <span className="font-bold text-lg">TV AO VIVO</span>
          </button>
          <button 
            tabIndex={0}
            onClick={() => navigate('/tv-esportes')}
            className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-cyan-600 to-cyan-800 rounded-xl hover:scale-105 transition-transform focus:outline-none focus:ring-4 focus:ring-white group"
          >
            <MonitorPlay className="w-12 h-12 mb-2 group-focus:scale-110 transition-transform" />
            <span className="font-bold text-lg">TV ESPORTES</span>
          </button>
          <button 
            tabIndex={0}
            onClick={() => navigate('/movies')}
            className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-red-600 to-red-800 rounded-xl hover:scale-105 transition-transform focus:outline-none focus:ring-4 focus:ring-white group"
          >
            <Film className="w-12 h-12 mb-2 group-focus:scale-110 transition-transform" />
            <span className="font-bold text-lg">FILMES</span>
          </button>
          <button 
            tabIndex={0}
            onClick={() => navigate('/series')}
            className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-600 to-green-800 rounded-xl hover:scale-105 transition-transform focus:outline-none focus:ring-4 focus:ring-white group"
          >
            <Clapperboard className="w-12 h-12 mb-2 group-focus:scale-110 transition-transform" />
            <span className="font-bold text-lg">SÉRIES</span>
          </button>
          <button 
            tabIndex={0}
            onClick={() => navigate('/kids')}
            className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-xl hover:scale-105 transition-transform focus:outline-none focus:ring-4 focus:ring-white group"
          >
            <Smile className="w-12 h-12 mb-2 group-focus:scale-110 transition-transform" />
            <span className="font-bold text-lg">KIDS</span>
          </button>
          <button 
            tabIndex={0}
            onClick={() => navigate('/my-list')}
            className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-pink-600 to-pink-800 rounded-xl hover:scale-105 transition-transform focus:outline-none focus:ring-4 focus:ring-white group"
          >
            <List className="w-12 h-12 mb-2 group-focus:scale-110 transition-transform" />
            <span className="font-bold text-lg">MINHA LISTA</span>
          </button>
          <button 
            tabIndex={0}
            onClick={() => navigate('/continue-watching')}
            className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-orange-600 to-orange-800 rounded-xl hover:scale-105 transition-transform focus:outline-none focus:ring-4 focus:ring-white group"
          >
            <History className="w-12 h-12 mb-2 group-focus:scale-110 transition-transform" />
            <span className="font-bold text-lg">CONTINUAR ASSISTINDO</span>
          </button>
        </div>

        <section className="md:space-y-24 relative z-10">
          {watchHistory.length > 0 && (
            <div id="continue-watching">
              <Row 
                title="Continuar Assistindo" 
                movies={watchHistory} 
                onMovieClick={handleMovieClick} 
              />
            </div>
          )}
          <div id="series">
            <Row title="Séries Netflix" fetchUrl={requests.fetchNetflixOriginals} isLargeRow onMovieClick={handleMovieClick} />
          </div>
          <div id="animes">
            <Row title="Animes" fetchUrl={requests.fetchAnimes} isLargeRow onMovieClick={handleMovieClick} />
          </div>
          <div id="trending">
            <Row title="Bombando" fetchUrl={requests.fetchTrending} onMovieClick={handleMovieClick} />
          </div>
          <div id="movies">
            <Row title="Mais Votados" fetchUrl={requests.fetchTopRated} onMovieClick={handleMovieClick} />
            <Row title="Filmes de Ação" fetchUrl={requests.fetchActionMovies} onMovieClick={handleMovieClick} />
            <Row title="Comédias" fetchUrl={requests.fetchComedyMovies} onMovieClick={handleMovieClick} />
            <Row title="Terror" fetchUrl={requests.fetchHorrorMovies} onMovieClick={handleMovieClick} />
            <Row title="Romance" fetchUrl={requests.fetchRomanceMovies} onMovieClick={handleMovieClick} />
            <Row title="Documentários" fetchUrl={requests.fetchDocumentaries} onMovieClick={handleMovieClick} />
          </div>
        </section>
        <Footer />
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

export default Home;
