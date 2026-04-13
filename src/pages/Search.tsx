import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import api, { requests } from '../services/api';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(requests.fetchSearch(query));
        // Filtrar apenas filmes e séries que tenham poster
        const filtered = data.results.filter((item: any) => 
          (item.media_type === 'movie' || item.media_type === 'tv') && 
          (item.poster_path || item.backdrop_path)
        );
        setResults(filtered);
      } catch (error) {
        console.error("Erro na busca:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const handleMovieClick = (movie: any) => {
    setSelectedMovie(movie);
    setShowModal(true);
  };

  return (
    <div className="relative min-h-screen bg-[#141414]">
      <Navbar />
      
      <main className="pt-24 px-4 lg:px-12">
        <h2 className="text-xl font-semibold text-gray-400 mb-8">
          Resultados para: <span className="text-white italic">"{query}"</span>
        </h2>

        {loading ? (
          <div className="flex justify-center pt-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-netflix-red"></div>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {results.map((item) => (
              <div 
                key={item.id}
                className="relative cursor-pointer transition-transform duration-200 hover:scale-105"
                onClick={() => handleMovieClick(item)}
              >
                <img
                  src={`https://image.tmdb.org/t/p/w500/${item.poster_path || item.backdrop_path}`}
                  alt={item.title || item.name}
                  className="rounded-sm object-cover w-full h-auto"
                />
                <div className="mt-2 text-sm text-gray-300">
                  {item.title || item.name}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center pt-20">
            <p className="text-gray-400 text-lg">Nenhum resultado encontrado para sua busca.</p>
          </div>
        )}
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

export default Search;
