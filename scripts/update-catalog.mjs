// Busca os IDs do catálogo embedplayapi.site e gera public/catalog-ids.json
// Uso: npm run update-catalog
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'public', 'catalog-ids.json');
const API = 'https://embedplayapi.site/api';

async function fetchIds(type) {
  const url = type ? `${API}/all-ids?type=${type}` : `${API}/all-ids`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} em ${url}`);
  const data = await res.json();
  if (data?.status !== 'success') throw new Error(`Resposta inesperada de ${url}`);
  return data.results || {};
}

const extract = (list) =>
  [...new Set((list || []).map((i) => Number(i.tmdb_id)).filter(Boolean))].sort((a, b) => a - b);

const [movies, series] = await Promise.all([fetchIds('movie'), fetchIds('series')]);

const catalog = {
  updated_at: new Date().toISOString(),
  m: extract(movies.movies),
  s: extract(series.series),
};

await writeFile(OUT, JSON.stringify(catalog), 'utf8');
console.log(`catalog-ids.json gerado: ${catalog.m.length} filmes, ${catalog.s.length} séries`);
