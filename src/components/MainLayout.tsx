import Navbar from './Navbar';
import { useLocation } from 'react-router-dom';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const noChromeRoutes = ['/login', '/signup', '/plans', '/player', '/watch'];
  // Páginas de embed/tela cheia com controles próprios: sem Navbar para não sobrepor botões
  const noNavbarRoutes = ['/movies', '/series', '/tv', '/tv-esportes', '/filmes-pagos', '/superhqs'];

  if (noChromeRoutes.some(route => location.pathname.startsWith(route))) {
    return <>{children}</>;
  }

  // Layout estilo RG2-Play-flix: Navbar fixa no topo em todas as páginas
  return (
    <div className="bg-[#141414] min-h-screen">
      {!noNavbarRoutes.some(route => location.pathname.startsWith(route)) && <Navbar />}
      <div>{children}</div>
    </div>
  );
};

export default MainLayout;
