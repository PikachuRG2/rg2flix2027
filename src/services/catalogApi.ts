import axios from 'axios';

const CATALOG_BASE_URL = 'https://embedplayapi.site/api';

export const catalogRequests = {
  fetchAll: '/all-ids',
  fetchMovies: '/all-ids?type=movie',
  fetchSeries: '/all-ids?type=series',
};

const catalogInstance = axios.create({
  baseURL: CATALOG_BASE_URL,
});

export default catalogInstance;
