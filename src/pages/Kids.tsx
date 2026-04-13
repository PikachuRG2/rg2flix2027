import { useState } from 'react';
import Banner from '../components/Banner';
import Row from '../components/Row';
import Modal from '../components/Modal';
import Footer from '../components/Footer';
import { requests } from '../services/api';

const Kids = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);

  const handleMovieClick = (movie: any) => {
    setSelectedMovie(movie);
    setShowModal(true);
  };

  return (
    <div className={`relative min-h-screen bg-[#141414] ${showModal && 'overflow-hidden'}`}>
      <main className="relative pb-24 lg:space-y-24 z-10">
        <Banner fetchUrl={requests.fetchAnimationMovies} onMovieClick={handleMovieClick} />
        
        <section className="md:space-y-24 relative z-10">
          <div id="drawings">
            <Row title="Desenhos Animados" fetchUrl={requests.fetchKidsTV} isLargeRow onMovieClick={handleMovieClick} />
          </div>
          <div id="animation-movies">
            <Row title="Filmes de Animação" fetchUrl={requests.fetchAnimationMovies} onMovieClick={handleMovieClick} />
          </div>
          <div id="family">
            <Row title="Para toda a Família" fetchUrl={requests.fetchKidsMovies} onMovieClick={handleMovieClick} />
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

export default Kids;
