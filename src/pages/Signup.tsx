import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup(email, password);
      navigate('/plans');
    } catch (error: any) {
      console.error('Erro ao criar conta:', error);
      alert(error.message || 'Erro ao criar conta');
    }
  };

  return (
    <div className="relative flex h-screen w-screen flex-col bg-black md:items-center md:justify-center md:bg-transparent">
      <div className="absolute top-0 left-0 -z-10 h-full w-full bg-hero-pattern bg-cover bg-no-repeat opacity-50 hidden md:block" />
      
      <div className="md:px-14 py-4 md:absolute md:top-0 md:left-0 flex items-center space-x-2">
        <img src="/logo.png" alt="RG2 FLIX" className="h-10 md:h-12 object-contain" />
        <h1 className="text-3xl font-bold text-white">RG2 FLIX</h1>
      </div>

      <form 
        onSubmit={handleSubmit}
        className="relative mt-24 space-y-8 rounded bg-black/75 py-10 px-6 md:mt-0 md:max-w-md md:px-14"
      >
        <h1 className="text-4xl font-semibold">Criar conta</h1>
        
        <div className="space-y-4">
          <label className="inline-block w-full">
            <input 
              type="email" 
              placeholder="Email" 
              className="input w-full rounded bg-[#333] px-5 py-3.5 placeholder-[gray] outline-none focus:bg-[#454545]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="inline-block w-full">
            <input 
              type="password" 
              placeholder="Senha" 
              className="input w-full rounded bg-[#333] px-5 py-3.5 placeholder-[gray] outline-none focus:bg-[#454545]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
        </div>

        <button 
          type="submit"
          className="w-full rounded bg-netflix-red py-3.5 font-semibold text-white transition hover:bg-red-700"
        >
          Cadastrar
        </button>

        <div className="text-[gray]">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-white hover:underline">
            Entrar agora.
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Signup;
