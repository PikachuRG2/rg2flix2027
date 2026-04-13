import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Banner from '../components/Banner';
import Row from '../components/Row';
import Modal from '../components/Modal';
import Footer from '../components/Footer';
import { requests } from '../services/api';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [watchHistory, setWatchHistory] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('watch_history')
        .select('*')
        .eq('user_id', user.id)
        .order('last_watched_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        // Mapear para extrair o movie_data que salvamos
        const movies = data.map(item => ({
          ...item.movie_data,
          // Adicionar info de progresso se tivermos salvo
          continue_watching: {
            season: item.season,
            episode: item.episode
          }
        }));
        setWatchHistory(movies);
      }
    };

    fetchHistory();
  }, [user]);

  const handleMovieClick = (movie: any) => {
    console.log("Movie clicked:", movie);
    setSelectedMovie(movie);
    setShowModal(true);
  };

  return (
    <div className={`relative min-h-screen bg-[#141414] ${showModal && 'overflow-hidden'}`}>
      <Navbar />
      <main className="relative pb-24 lg:space-y-24 z-10">
        <Banner fetchUrl={requests.fetchNetflixOriginals} onMovieClick={handleMovieClick} />
        
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
