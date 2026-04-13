import axios from 'axios';

const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY || 'ff60e66f';
const OMDB_BASE_URL = 'https://www.omdbapi.com/';

const omdbApi = axios.create({
  baseURL: OMDB_BASE_URL,
});

export const fetchOmdbDetails = async (imdbId: string) => {
  try {
    const { data } = await omdbApi.get('', {
      params: {
        i: imdbId,
        apikey: OMDB_API_KEY,
      },
    });
    return data;
  } catch (error) {
    console.error('Erro ao buscar dados no OMDB:', error);
    return null;
  }
};

export default omdbApi;
