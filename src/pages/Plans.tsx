import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

interface Plan {
  id: string;
  name: string;
  price: number;
}

const Plans = () => {
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'standard' | 'premium'>('standard');
  const [plans, setPlans] = useState<Plan[]>([
    { id: 'basic', name: 'Básico', price: 25.90 },
    { id: 'standard', name: 'Padrão', price: 39.90 },
    { id: 'premium', name: 'Premium', price: 55.90 }
  ]);
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const plansRef = collection(db, 'plans');
      const querySnapshot = await getDocs(plansRef);
      if (!querySnapshot.empty) {
        setPlans(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Plan)));
      }
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
    }
  };

  const handleSubscribe = async () => {
    // Atualiza o plano no banco de dados antes de mostrar o modal
    if (user) {
      try {
        const userRef = doc(db, 'profiles', user.id);
        await updateDoc(userRef, { plan: 'standard' });
        updateUser({ plan: 'standard' });
        setShowSuccessModal(true);
      } catch (error) {
        console.error('Erro ao atualizar plano:', error);
      }
    }
  };

  const handleModalClose = async () => {
    await logout();
    navigate('/login');
  };

  const getPlanPrice = (id: string) => {
    const plan = plans.find(p => p.id === id);
    return plan ? `R$ ${plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês` : '';
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      <header className="border-b border-gray-200 px-10 py-5 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="RG2 FLIX" className="h-8 md:h-10 object-contain" />
          <h1 className="text-3xl font-bold text-gray-900">RG2 FLIX</h1>
        </div>
        <button className="font-semibold text-lg hover:underline">Sair</button>
      </header>

      <main className="max-w-5xl mx-auto pt-10 px-10 pb-20">
        <h1 className="text-3xl font-bold mb-4">Escolha o plano ideal para você</h1>
        <ul className="space-y-3 mb-10">
          <li className="flex items-center gap-2 text-lg"><Check className="text-netflix-red" /> Assista onde quiser.</li>
          <li className="flex items-center gap-2 text-lg"><Check className="text-netflix-red" /> Recomendações personalizadas.</li>
          <li className="flex items-center gap-2 text-lg"><Check className="text-netflix-red" /> Mude ou cancele seu plano quando quiser.</li>
        </ul>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {/* Básico - Desabilitado */}
          <div 
            className={`p-6 rounded-md border-2 transition opacity-50 grayscale cursor-not-allowed border-gray-200`}
          >
            <div className={`text-center font-bold p-4 rounded mb-4 bg-netflix-red/10 text-netflix-red`}>Básico</div>
            <p className="text-center font-bold">{getPlanPrice('basic')}</p>
          </div>

          {/* Padrão - Único Clicável */}
          <div 
            onClick={() => setSelectedPlan('standard')}
            className={`cursor-pointer p-6 rounded-md border-2 transition border-netflix-red shadow-lg sm:scale-105`}
          >
            <div className={`text-center font-bold p-4 rounded mb-4 bg-netflix-red text-white`}>Padrão</div>
            <p className="text-center font-bold">{getPlanPrice('standard')}</p>
          </div>

          {/* Premium - Desabilitado */}
          <div 
            className={`p-6 rounded-md border-2 transition opacity-50 grayscale cursor-not-allowed border-gray-200`}
          >
            <div className={`text-center font-bold p-4 rounded mb-4 bg-netflix-red/10 text-netflix-red`}>Premium</div>
            <p className="text-center font-bold">{getPlanPrice('premium')}</p>
          </div>
        </div>

        <button 
          onClick={handleSubscribe}
          className="w-full max-w-sm mx-auto block bg-netflix-red text-white py-4 rounded font-bold text-xl hover:bg-red-700 transition"
        >
          Próximo
        </button>
      </main>

      {/* Modal de Sucesso */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-lg max-w-md w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Parabéns!</h2>
            <p className="text-gray-600 mb-6 text-lg leading-relaxed">
              Seu perfil foi criado com sucesso. Agora preencha novamente seu login para entrar na sua conta.
            </p>
            <button
              onClick={handleModalClose}
              className="w-full bg-netflix-red text-white py-3 rounded-md font-bold text-lg hover:bg-red-700 transition-colors shadow-lg"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plans;
