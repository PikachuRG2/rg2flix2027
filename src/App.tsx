import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import SecurityManager from './components/SecurityManager';
import MainLayout from './components/MainLayout';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false, planRequired = false }: { children: JSX.Element, adminOnly?: boolean, planRequired?: boolean }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-black">Carregando...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;
  if (planRequired && user.role !== 'admin' && (!user.plan || user.plan === 'standard')) return <Navigate to="/plans" />;

  return <MainLayout>{children}</MainLayout>;
};

function App() {
  return (
    <AuthProvider>
      <SecurityManager />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/plans" element={<Plans />} />
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
              <ProtectedRoute planRequired>
                <TV />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tv-esportes" 
            element={
              <ProtectedRoute planRequired>
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
