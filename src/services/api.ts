import axios from 'axios';

const BASE_URL = 'https://api.themoviedb.org/3';

export const requests = {
  fetchTrending: `/trending/all/week?language=pt-BR&region=BR`,
  fetchNetflixOriginals: `/discover/tv?with_networks=213&watch_region=BR&with_original_language=en|pt|es`,
  fetchTopRated: `/movie/top_rated?watch_region=BR&language=pt-BR`,
  fetchActionMovies: `/discover/movie?with_genres=28&watch_region=BR&with_original_language=en|pt|es`,
  fetchComedyMovies: `/discover/movie?with_genres=35&watch_region=BR&with_original_language=en|pt|es`,
  fetchHorrorMovies: `/discover/movie?with_genres=27&watch_region=BR&with_original_language=en|pt|es`,
  fetchRomanceMovies: `/discover/movie?with_genres=10749&watch_region=BR&with_original_language=en|pt|es`,
  fetchDocumentaries: `/discover/movie?with_genres=99&watch_region=BR&with_original_language=en|pt|es`,
  fetchAnimes: `/discover/tv?with_genres=16&with_original_language=ja&language=pt-BR`,
  fetchKidsMovies: `/discover/movie?with_genres=10751&language=pt-BR`,
  fetchKidsTV: `/discover/tv?with_genres=10762&language=pt-BR`,
  fetchAnimationMovies: `/discover/movie?with_genres=16&language=pt-BR`,
  fetchMovieVideos: (id: number) => `/movie/${id}/videos?language=pt-BR`,
  fetchTvVideos: (id: number) => `/tv/${id}/videos?language=pt-BR`,
  fetchSearch: (query: string) => `/search/multi?query=${encodeURIComponent(query)}&include_adult=false&language=pt-BR&region=BR`,
  fetchExternalIds: (type: string, id: string) => `/${type}/${id}/external_ids`,
};

const instance = axios.create({
  baseURL: BASE_URL,
});

// Adicionar a API Key ou Bearer Token em todas as requisições automaticamente
instance.interceptors.request.use((config) => {
  const apiKey = import.meta.env.VITE_TMDB_KEY;
  const apiToken = import.meta.env.VITE_TMDB_TOKEN;
  
  if (!apiKey && !apiToken) {
    console.warn('TMDB API Key ou Token não encontrados! Verifique seu arquivo .env');
  }

  // Se tivermos o Bearer Token, usamos no Header (Método mais seguro e moderno)
  if (apiToken) {
    config.headers.Authorization = `Bearer ${apiToken}`;
  } else {
    // Caso contrário, usamos a API Key na URL como fallback
    config.params = {
      ...config.params,
      api_key: apiKey,
    };
  }

  config.params = {
    ...config.params,
    language: 'pt-BR',
    region: 'BR',
  };
  
  return config;
});

export default instance;
