import { useState } from 'react';
import Row from '../components/Row';
import Modal from '../components/Modal';
import Footer from '../components/Footer';
import { requests } from '../services/api';

const Movies = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);

  const handleMovieClick = (movie: any) => {
    setSelectedMovie(movie);
    setShowModal(true);
  };

  return (
    <div className={`relative min-h-screen bg-[#141414] ${showModal && 'overflow-hidden'}`}>
      <main className="pt-24 pb-24 relative z-10">
        <h1 className="text-3xl font-bold px-4 md:px-12 mb-4">Filmes</h1>
        <Row title="Mais Votados" fetchUrl={requests.fetchTopRated} isLargeRow onMovieClick={handleMovieClick} />
        <Row title="Filmes de Ação" fetchUrl={requests.fetchActionMovies} onMovieClick={handleMovieClick} />
        <Row title="Comédias" fetchUrl={requests.fetchComedyMovies} onMovieClick={handleMovieClick} />
        <Row title="Terror" fetchUrl={requests.fetchHorrorMovies} onMovieClick={handleMovieClick} />
        <Row title="Romance" fetchUrl={requests.fetchRomanceMovies} onMovieClick={handleMovieClick} />
        <Row title="Documentários" fetchUrl={requests.fetchDocumentaries} onMovieClick={handleMovieClick} />
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

export default Movies;
