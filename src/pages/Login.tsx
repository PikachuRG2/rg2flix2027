import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      console.error("Erro ao fazer login:", err);
      // Traduzir mensagens comuns do Supabase/Auth
      if (err.message === 'Invalid login credentials') {
        setError("Email ou senha incorretos. Tente novamente.");
      } else if (err.message.includes('Email not confirmed')) {
        setError("Por favor, confirme seu email antes de entrar.");
      } else {
        setError("Ocorreu um erro ao entrar. Verifique seus dados.");
      }
    } finally {
      setLoading(false);
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
        className="relative mt-24 space-y-8 rounded bg-black/75 py-10 px-6 md:mt-0 md:max-w-md md:px-14 shadow-2xl border border-white/5"
      >
        <h1 className="text-4xl font-semibold">Entrar</h1>
        
        {error && (
          <div className="bg-[#e87c03] p-3 rounded text-white text-sm animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <label className="inline-block w-full group">
            <input 
              type="email" 
              placeholder="Email" 
              className="w-full rounded bg-[#333] px-5 py-3.5 placeholder-[gray] outline-none focus:bg-[#454545] text-white transition-all border-b-2 border-transparent focus:border-red-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </label>
          <label className="inline-block w-full">
            <input 
              type="password" 
              placeholder="Senha" 
              className="w-full rounded bg-[#333] px-5 py-3.5 placeholder-[gray] outline-none focus:bg-[#454545] text-white transition-all border-b-2 border-transparent focus:border-red-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </label>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className={`w-full rounded bg-red-600 py-3.5 font-bold text-white transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2
            ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-700 hover:shadow-lg shadow-red-600/20'}
          `}
        >
          {loading ? (
            <>
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Entrando...
            </>
          ) : (
            'Entrar'
          )}
        </button>

        <div className="text-[gray]">
          Novo por aqui?{' '}
          <Link to="/signup" className="text-white hover:underline">
            Assine agora.
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;