import { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import Footer from '../components/Footer';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const MyList = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchList = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const listRef = collection(db, 'my_list');
      const q = query(listRef, where('user_id', '==', user.id));
      const querySnapshot = await getDocs(q);
      
      const items = querySnapshot.docs.map(doc => doc.data().movie_data);
      setList(items);
    } catch (error) {
      console.error('Erro ao buscar lista:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchList();
  }, [user]);

  const handleMovieClick = (movie: any) => {
    setSelectedMovie(movie);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    fetchList(); // Recarregar a lista caso algum item tenha sido removido
  };

  return (
    <div className={`relative min-h-screen bg-[#141414] ${showModal && 'overflow-hidden'}`}>
      <main className="pt-24 px-4 lg:px-12 pb-24">
        <h1 className="text-3xl font-bold mb-8">Minha Lista</h1>

        {loading ? (
          <div className="flex justify-center pt-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : list.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {list.map((item, index) => (
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
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center pt-20">
            <p className="text-gray-400 text-lg">Você ainda não adicionou nada à sua lista.</p>
          </div>
        )}
        <Footer />
      </main>

      {showModal && (
        <Modal 
          movie={selectedMovie} 
          onClose={handleModalClose} 
        />
      )}
    </div>
  );
};

export default MyList;
