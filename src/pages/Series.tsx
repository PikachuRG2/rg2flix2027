import { useState } from 'react';
import Row from '../components/Row';
import Modal from '../components/Modal';
import Footer from '../components/Footer';
import { requests } from '../services/api';

const Series = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);

  const handleMovieClick = (movie: any) => {
    setSelectedMovie(movie);
    setShowModal(true);
  };

  return (
    <div className={`relative min-h-screen bg-[#141414] ${showModal && 'overflow-hidden'}`}>
      <main className="pt-24 pb-24 relative z-10">
        <h1 className="text-3xl font-bold px-4 md:px-12 mb-4">Séries</h1>
        <Row title="Séries Netflix" fetchUrl={requests.fetchNetflixOriginals} isLargeRow onMovieClick={handleMovieClick} />
        <Row title="Séries Populares" fetchUrl={requests.fetchSeriesPopular} isLargeRow onMovieClick={handleMovieClick} />
        <Row title="Séries Mais Votadas" fetchUrl={requests.fetchSeriesTopRated} onMovieClick={handleMovieClick} />
        <Row title="Animes" fetchUrl={requests.fetchAnimes} isLargeRow onMovieClick={handleMovieClick} />
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

export default Series;
