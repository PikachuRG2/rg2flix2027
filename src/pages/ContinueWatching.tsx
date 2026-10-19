import { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import Footer from '../components/Footer';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const ContinueWatching = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      setLoading(true);
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
        setHistory(movies);
      } catch (error) {
        console.error('Erro ao buscar histórico:', error);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [user]);

  const handleMovieClick = (movie: any) => {
    setSelectedMovie(movie);
    setShowModal(true);
  };

  return (
    <div className={`relative min-h-screen bg-[#141414] ${showModal && 'overflow-hidden'}`}>
      <main className="pt-24 px-4 lg:px-12 pb-24">
        <h1 className="text-3xl font-bold mb-8">Continuar Assistindo</h1>

        {loading ? (
          <div className="flex justify-center pt-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : history.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {history.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                tabIndex={0}
                className="relative cursor-pointer transition-transform duration-200 hover:scale-105 group focus:outline-none focus:ring-4 focus:ring-red-600 rounded-lg p-1"
                onClick={() => handleMovieClick(item)}
                onKeyDown={(e) => e.key === 'Enter' && handleMovieClick(item)}
              >
                <img
                  src={`https://image.tmdb.org/t/p/w500/${item.poster_path || item.backdrop_path}`}
                  alt={item.title || item.name}
                  className="rounded-sm object-cover w-full h-auto"
                />
                <div className="mt-2 text-sm text-gray-300 group-hover:text-white truncate">
                  {item.title || item.name || item.original_name}
                  {item.continue_watching?.season && (
                    <span className="text-gray-500"> · T{item.continue_watching.season} E{item.continue_watching.episode}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center pt-20">
            <p className="text-gray-400 text-lg">Você ainda não assistiu nada. Comece agora!</p>
          </div>
        )}
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

export default ContinueWatching;
