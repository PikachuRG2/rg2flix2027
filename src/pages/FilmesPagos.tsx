import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import EmbedPage from '../components/EmbedPage';

const FilmesPagos = () => {
  const { user } = useAuth();

  // Verificar se o usuário tem acesso: admin, basic ou premium
  const hasAccess = 
    user?.role === 'admin' || 
    user?.plan === 'basic' || 
    user?.plan === 'premium';

  if (!hasAccess) {
    return <Navigate to="/vip-plans" />;
  }

  return (
    <EmbedPage
      url="https://rg2tv.blogspot.com/p/teste-dfinal-codigo-fonte.html"
      title="RG2 Filmes Pagos"
    />
  );
};

export default FilmesPagos;
