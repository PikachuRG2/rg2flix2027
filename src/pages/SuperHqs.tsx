import { useState } from 'react';
import EmbedPage from '../components/EmbedPage';

const sections = [
  { key: 'filmes', label: '🎬 Filmes', url: 'https://superhqs.totalh.net/?c=/-filmes/' },
  { key: 'series', label: '📺 Séries', url: 'https://superhqs.totalh.net/?c=/-series' },
  { key: 'hqs', label: '📚 HQs', url: 'https://superhqs.totalh.net/?c=/HQs' },
  { key: 'animes', label: '🇯🇵 Animes', url: 'https://superhqs.totalh.net/?c=/animes' },
  { key: 'doramas', label: '🌸 Doramas', url: 'https://superhqs.totalh.net/?c=/doramas' },
  { key: 'novelas', label: '🎭 Novelas', url: 'https://superhqs.totalh.net/?c=/novelas' },
  { key: 'canais', label: '📡 Canais', url: 'https://superhqs.totalh.net/player/player.php?c=/-canais' },
];

const SuperHqs = () => {
  const [active, setActive] = useState(sections[0]);

  return (
    <div className="relative">
      {/* Seletor de seções do SuperHQs (barra inferior para não cobrir os botões do topo) */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 bg-black/85 backdrop-blur-sm border border-white/15 rounded-full px-3 py-2 flex gap-2 overflow-x-auto max-w-[95vw]">
        {sections.map((s) => (
          <button
            key={s.key}
            onClick={() => setActive(s)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              active.key === s.key
                ? 'bg-red-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <EmbedPage url={active.url} title={`SuperHQs ${active.label}`} />
    </div>
  );
};

export default SuperHqs;
