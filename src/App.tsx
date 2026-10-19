// HashRouter é necessário para o GitHub Pages (não há fallback de SPA no servidor)
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Plans from './pages/Plans';
import Admin from './pages/Admin';
import Player from './pages/Player';
import Search from './pages/Search';
import TV from './pages/TV';
import TvEsportes from './pages/TvEsportes';
import Kids from './pages/Kids';
import MyList from './pages/MyList';
import VipPlans from './pages/VipPlans';
import Movies from './pages/Movies';
import Series from './pages/Series';
import ContinueWatching from './pages/ContinueWatching';
import Devices from './pages/Devices';
import FilmesPagos from './pages/FilmesPagos';
import TermsOfUse from './pages/TermsOfUse';
import PrivacyPolicy from './pages/PrivacyPolicy';
import SecurityManager from './components/SecurityManager';
import OnlineUsersCounter from './components/OnlineUsersCounter';
import MainLayout from './components/MainLayout';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false, planRequired = false, tvRequired = false }: { children: JSX.Element, adminOnly?: boolean, planRequired?: boolean, tvRequired?: boolean }) => {
  const { user, loading, hasTrialAccess } = useAuth();

  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-black">Carregando...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;
  if (planRequired && user.role !== 'admin' && (!user.plan || user.plan === 'standard')) return <Navigate to="/plans" />;
  if (tvRequired && !hasTrialAccess()) return <Navigate to="/vip-plans" />;

  return <MainLayout>{children}</MainLayout>;
};

function App() {
  return (
    <AuthProvider>
      <SecurityManager />
      <OnlineUsersCounter />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/terms" element={<TermsOfUse />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route 
            path="/devices" 
            element={
              <ProtectedRoute>
                <Devices />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/filmes-pagos" 
            element={
              <ProtectedRoute>
                <FilmesPagos />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tv" 
            element={
              <ProtectedRoute tvRequired>
                <TV />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tv-esportes" 
            element={
              <ProtectedRoute tvRequired>
                <TvEsportes />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/kids" 
            element={
              <ProtectedRoute>
                <Kids />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-list" 
            element={
              <ProtectedRoute>
                <MyList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/vip-plans" 
            element={
              <ProtectedRoute>
                <VipPlans />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/movies" 
            element={
              <ProtectedRoute>
                <Movies />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/series" 
            element={
              <ProtectedRoute>
                <Series />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/continue-watching" 
            element={
              <ProtectedRoute>
                <ContinueWatching />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute adminOnly>
                <Admin />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/watch/:type/:id" 
            element={
              <ProtectedRoute>
                <Player />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/search" 
            element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
