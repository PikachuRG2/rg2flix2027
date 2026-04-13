import { useState, useEffect } from 'react';
import { Users, Film, LayoutDashboard, ChevronRight, Search, Plus, Trash2, Edit2, Check, X, CreditCard, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, updateDoc, deleteDoc, getCountFromServer } from 'firebase/firestore';
import api from '../services/api';

interface UserProfile {
  id: string;
  email?: string;
  role: string;
  plan: string | null;
  profiles: string[];
  created_at?: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
}

const Admin = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'content' | 'plans'>('dashboard');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ role: string; plan: string | null }>({ role: 'user', plan: null });
  const [showSidebar, setShowSidebar] = useState(false);

  // Plans Management
  const [plans, setPlans] = useState<Plan[]>([]);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [planForm, setPlanForm] = useState<{ price: number }>({ price: 0 });

  // Content Management
  const [searchContent, setSearchContent] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [customLinks, setCustomLinks] = useState<any[]>([]);
  const [addingLinkTo, setAddingLinkTo] = useState<any>(null);
  const [newLinkUrl, setNewLinkUrl] = useState('');

  // Bulk Import
  const [bulkImportText, setBulkImportText] = useState('');
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [bulkResults, setBulkResults] = useState<any[]>([]);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);

  // Dashboard Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    activePlans: 0,
    revenue: 0
  });

  useEffect(() => {
    fetchUsers();
    fetchStats();
    fetchCustomLinks();
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const plansRef = collection(db, 'plans');
      const querySnapshot = await getDocs(plansRef);
      
      if (!querySnapshot.empty) {
        setPlans(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Plan)));
      } else {
        const defaultPlans = [
          { id: 'basic', name: 'Básico', price: 25.90 },
          { id: 'standard', name: 'Padrão', price: 39.90 },
          { id: 'premium', name: 'Premium', price: 55.90 }
        ];
        setPlans(defaultPlans);
        for (const plan of defaultPlans) {
          await setDoc(doc(db, 'plans', plan.id), { name: plan.name, price: plan.price });
        }
      }
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
    }
  };

  const handleUpdatePlan = async (planId: string) => {
    try {
      const planRef = doc(db, 'plans', planId);
      await updateDoc(planRef, { price: planForm.price });
      setEditingPlan(null);
      fetchPlans();
    } catch (error) {
      alert('Erro ao atualizar plano');
    }
  };

  const fetchCustomLinks = async () => {
    try {
      const linksRef = collection(db, 'custom_links');
      const querySnapshot = await getDocs(linksRef);
      setCustomLinks(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Erro ao buscar links:', error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, 'profiles');
      const querySnapshot = await getDocs(usersRef);
      setUsers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile)));
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const usersRef = collection(db, 'profiles');
      const totalCount = await getCountFromServer(usersRef);
      
      const activeQuery = query(usersRef, where('plan', '!=', null));
      const activeCount = await getCountFromServer(activeQuery);
      
      setStats({
        totalUsers: totalCount.data().count,
        activePlans: activeCount.data().count,
        revenue: activeCount.data().count * 39.90
      });
    } catch (error) {
      console.error('Erro ao buscar stats:', error);
    }
  };

  const handleUpdateUser = async (userId: string) => {
    try {
      const userRef = doc(db, 'profiles', userId);
      await updateDoc(userRef, { role: editForm.role, plan: editForm.plan });
      setEditingUser(null);
      fetchUsers();
      fetchStats();
    } catch (error) {
      alert('Erro ao atualizar usuário');
    }
  };

  const handleSearchTMDB = async (query?: string) => {
    const searchQuery = query || searchContent;
    if (!searchQuery) return null;
    try {
      const { data } = await api.get(`/search/multi?query=${encodeURIComponent(searchQuery)}`);
      const results = data.results.filter((i: any) => i.media_type === 'movie' || i.media_type === 'tv');
      if (!query) setSearchResults(results);
      return results[0];
    } catch (error) {
      console.error('Erro ao buscar no TMDB:', error);
      return null;
    }
  };

  const handleProcessBulk = async () => {
    setIsProcessingBulk(true);
    const lines = bulkImportText.split('\n').filter(line => line.trim());
    const results: any[] = [];

    for (const line of lines) {
      const parts = line.split(/[;,-]/);
      const name = parts[0]?.trim();
      const url = parts[parts.length - 1]?.trim();

      if (name && url && url.startsWith('http')) {
        const tmdbMatch = await handleSearchTMDB(name);
        if (tmdbMatch) {
          results.push({
            tmdb_id: tmdbMatch.id.toString(),
            media_type: tmdbMatch.media_type,
            title: tmdbMatch.title || tmdbMatch.name,
            url: url,
            poster: tmdbMatch.poster_path
          });
        }
      }
    }
    setBulkResults(results);
    setIsProcessingBulk(false);
  };

  const handleSaveBulk = async () => {
    try {
      for (const r of bulkResults) {
        await setDoc(doc(db, 'custom_links', r.tmdb_id), {
          tmdb_id: r.tmdb_id,
          media_type: r.media_type,
          title: r.title,
          url: r.url
        });
      }
      setBulkResults([]);
      setBulkImportText('');
      setIsBulkImportOpen(false);
      fetchCustomLinks();
    } catch (error: any) {
      alert('Erro ao salvar em massa: ' + error.message);
    }
  };

  const handleSaveCustomLink = async () => {
    if (!addingLinkTo || !newLinkUrl) return;

    try {
      await setDoc(doc(db, 'custom_links', addingLinkTo.id.toString()), {
        tmdb_id: addingLinkTo.id.toString(),
        media_type: addingLinkTo.media_type,
        url: newLinkUrl,
        title: addingLinkTo.title || addingLinkTo.name
      });
      setAddingLinkTo(null);
      setNewLinkUrl('');
      fetchCustomLinks();
    } catch (error: any) {
      alert('Erro ao salvar link: ' + error.message);
    }
  };

  const handleDeleteLink = async (tmdbId: string) => {
    try {
      await deleteDoc(doc(db, 'custom_links', tmdbId));
      fetchCustomLinks();
    } catch (error) {
      alert('Erro ao deletar');
    }
  };

  const filteredUsers = users.filter(u => 
    (u.id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (u.role?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#141414] text-white overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-black border-b border-gray-800">
        <h1 className="text-xl font-bold text-red-600">ADMIN RG2</h1>
        <button onClick={() => setShowSidebar(!showSidebar)}>
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-0 z-50 md:relative md:flex md:w-64 bg-black p-6 space-y-8 border-r border-gray-800 transition-transform duration-300
        ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full w-full">
          <div className="flex justify-between items-center md:block mb-8">
            <h1 className="text-2xl font-bold text-red-600">ADMIN RG2</h1>
            <button className="md:hidden" onClick={() => setShowSidebar(false)}><X size={24} /></button>
          </div>
          
          <nav className="space-y-4">
            <button 
              onClick={() => { setActiveTab('dashboard'); setShowSidebar(false); }}
              className={`flex items-center space-x-3 w-full p-3 rounded transition focus-visible:bg-red-700 outline-none ${activeTab === 'dashboard' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </button>
            <button 
              onClick={() => { setActiveTab('users'); setShowSidebar(false); }}
              className={`flex items-center space-x-3 w-full p-3 rounded transition focus-visible:bg-red-700 outline-none ${activeTab === 'users' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`}
            >
              <Users size={20} />
              <span>Usuários</span>
            </button>
            <button 
              onClick={() => { setActiveTab('content'); setShowSidebar(false); }}
              className={`flex items-center space-x-3 w-full p-3 rounded transition focus-visible:bg-red-700 outline-none ${activeTab === 'content' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`}
            >
              <Film size={20} />
              <span>Conteúdo</span>
            </button>
            <button 
              onClick={() => { setActiveTab('plans'); setShowSidebar(false); }}
              className={`flex items-center space-x-3 w-full p-3 rounded transition focus-visible:bg-red-700 outline-none ${activeTab === 'plans' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`}
            >
              <CreditCard size={20} />
              <span>Planos</span>
            </button>
          </nav>

          <div className="mt-auto pt-8">
            <Link to="/" className="text-gray-500 hover:text-white flex items-center space-x-2 focus-visible:text-white outline-none">
              <span>Voltar para o site</span>
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <h2 className="text-2xl md:text-3xl font-bold capitalize">{activeTab}</h2>
          <div className="flex items-center w-full md:w-auto">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Pesquisar..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-900 border border-gray-700 rounded-full py-2 pl-10 pr-4 w-full focus:outline-none focus:border-red-600 text-sm"
              />
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
              <p className="text-gray-400 mb-2">Total de Usuários</p>
              <p className="text-4xl font-bold">{stats.totalUsers}</p>
              <p className="text-green-500 text-sm mt-2">No banco de dados</p>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
              <p className="text-gray-400 mb-2">Assinaturas Ativas</p>
              <p className="text-4xl font-bold">{stats.activePlans}</p>
              <p className="text-green-500 text-sm mt-2">Planos selecionados</p>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
              <p className="text-gray-400 mb-2">Receita Estimada</p>
              <p className="text-2xl md:text-4xl font-bold">R$ {stats.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="text-red-600 text-sm mt-2">Base: R$ 39,90/mês</p>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-black text-gray-400 uppercase text-xs">
                <tr>
                  <th className="p-4">ID do Usuário</th>
                  <th className="p-4">Cargo</th>
                  <th className="p-4">Plano</th>
                  <th className="p-4">Perfis</th>
                  <th className="p-4">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {loading ? (
                  <tr><td colSpan={5} className="p-10 text-center text-gray-500">Carregando usuários...</td></tr>
                ) : filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-gray-800/50 transition">
                    <td className="p-4 font-mono text-[10px] md:text-xs text-gray-400 max-w-[100px] truncate">{u.id}</td>
                    <td className="p-4">
                      {editingUser === u.id ? (
                        <select 
                          className="bg-gray-800 border border-gray-700 rounded p-1 text-xs"
                          value={editForm.role}
                          onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-red-600/20 text-red-600' : 'bg-blue-600/20 text-blue-600'}`}>
                          {u.role}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {editingUser === u.id ? (
                        <select 
                          className="bg-gray-800 border border-gray-700 rounded p-1 text-xs"
                          value={editForm.plan || ''}
                          onChange={(e) => setEditForm({...editForm, plan: e.target.value || null})}
                        >
                          <option value="">Sem plano</option>
                          <option value="basic">Básico</option>
                          <option value="standard">Padrão</option>
                          <option value="premium">Premium</option>
                        </select>
                      ) : (
                        <span className="text-xs text-gray-300">{u.plan || 'Sem plano'}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex -space-x-2">
                        {u.profiles?.map((p, i) => (
                          <div key={i} className="h-6 w-6 rounded bg-gray-700 border border-black flex items-center justify-center text-[10px]">
                            {p[0]}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {editingUser === u.id ? (
                          <>
                            <button onClick={() => handleUpdateUser(u.id)} className="text-green-500 hover:bg-green-500/10 p-1 rounded"><Check size={18} /></button>
                            <button onClick={() => setEditingUser(null)} className="text-red-500 hover:bg-red-500/10 p-1 rounded"><X size={18} /></button>
                          </>
                        ) : (
                          <button 
                            onClick={() => {
                              setEditingUser(u.id);
                              setEditForm({ role: u.role, plan: u.plan });
                            }} 
                            className="text-gray-400 hover:text-white p-1"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-8">
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Plus size={20} className="text-red-600" />
                  Gerenciar Conteúdo
                </h3>
                <button 
                  onClick={() => setIsBulkImportOpen(!isBulkImportOpen)}
                  className="bg-gray-800 text-sm px-4 py-2 rounded border border-gray-700 hover:bg-gray-700 transition"
                >
                  {isBulkImportOpen ? 'Voltar para Busca' : 'Importação em Massa'}
                </button>
              </div>

              {!isBulkImportOpen ? (
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      placeholder="Pesquisar filme ou série no TMDB..."
                      className="flex-1 bg-black border border-gray-700 rounded px-4 py-2 focus:border-red-600 outline-none"
                      value={searchContent}
                      onChange={(e) => setSearchContent(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchTMDB()}
                    />
                    <button 
                      onClick={() => handleSearchTMDB()}
                      className="bg-red-600 px-6 py-2 rounded font-bold hover:bg-red-700 transition"
                    >
                      Pesquisar
                    </button>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-96 overflow-y-auto p-2">
                      {searchResults.map((item) => (
                        <div 
                          key={item.id} 
                          className={`relative group cursor-pointer border-2 rounded transition ${addingLinkTo?.id === item.id ? 'border-red-600' : 'border-transparent'}`}
                          onClick={() => setAddingLinkTo(item)}
                        >
                          <img 
                            src={`https://image.tmdb.org/t/p/w200${item.poster_path}`} 
                            alt="" 
                            className="w-full h-40 object-cover rounded"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-xs text-center px-1">{item.title || item.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {addingLinkTo && (
                    <div className="mt-6 p-4 bg-black/40 rounded border border-red-600/30 animate-in fade-in slide-in-from-top-2">
                      <p className="mb-2 text-sm text-gray-400">Adicionando link para: <span className="text-white font-bold">{addingLinkTo.title || addingLinkTo.name}</span></p>
                      <div className="flex gap-4">
                        <input 
                          type="text" 
                          placeholder="Cole aqui o link do filme (ex: https://...)"
                          className="flex-1 bg-black border border-gray-700 rounded px-4 py-2 focus:border-red-600 outline-none"
                          value={newLinkUrl}
                          onChange={(e) => setNewLinkUrl(e.target.value)}
                        />
                        <button 
                          onClick={handleSaveCustomLink}
                          className="bg-green-600 px-6 py-2 rounded font-bold hover:bg-green-700 transition"
                        >
                          Salvar Link
                        </button>
                        <button 
                          onClick={() => setAddingLinkTo(null)}
                          className="bg-gray-800 px-6 py-2 rounded font-bold hover:bg-gray-700 transition"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="bg-black/40 p-4 rounded border border-blue-500/20">
                    <h4 className="font-bold text-blue-400 mb-2">Como usar a Importação em Massa:</h4>
                    <p className="text-sm text-gray-400">
                      Cole sua lista no formato: <code className="text-gray-200">Nome do Filme - Link</code> (um por linha).<br/>
                      Exemplo: <code className="text-gray-500">Batman - https://link.com/batman.mp4</code>
                    </p>
                  </div>
                  
                  <textarea 
                    className="w-full h-64 bg-black border border-gray-700 rounded p-4 text-sm font-mono outline-none focus:border-blue-600"
                    placeholder="Nome do Filme - Link..."
                    value={bulkImportText}
                    onChange={(e) => setBulkImportText(e.target.value)}
                  />

                  <div className="flex justify-end gap-4">
                    <button 
                      onClick={handleProcessBulk}
                      disabled={isProcessingBulk || !bulkImportText}
                      className="bg-blue-600 px-8 py-2 rounded font-bold hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-2"
                    >
                      {isProcessingBulk ? (
                        <><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div> Processando...</>
                      ) : 'Processar Lista'}
                    </button>
                  </div>

                  {bulkResults.length > 0 && (
                    <div className="mt-8 space-y-4">
                      <h4 className="font-bold border-b border-gray-800 pb-2">Resultados Encontrados ({bulkResults.length})</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
                        {bulkResults.map((res, i) => (
                          <div key={i} className="flex items-center gap-3 bg-black/40 p-2 rounded border border-gray-800">
                            <img src={`https://image.tmdb.org/t/p/w92${res.poster}`} alt="" className="h-16 w-12 object-cover rounded" />
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm truncate">{res.title}</p>
                              <p className="text-[10px] text-blue-400 truncate">{res.url}</p>
                            </div>
                            <button 
                              onClick={() => setBulkResults(prev => prev.filter((_, idx) => idx !== i))}
                              className="text-red-500 hover:text-red-400"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button 
                        onClick={handleSaveBulk}
                        className="w-full bg-green-600 py-3 rounded font-bold hover:bg-green-700 transition"
                      >
                        Confirmar e Salvar Tudo no Banco
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
              <h3 className="p-4 font-bold border-b border-gray-800">Links Cadastrados</h3>
              <table className="w-full text-left">
                <thead className="bg-black text-gray-400 uppercase text-xs">
                  <tr>
                    <th className="p-4">Título</th>
                    <th className="p-4">Tipo</th>
                    <th className="p-4">Link</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {customLinks.length === 0 ? (
                    <tr><td colSpan={4} className="p-10 text-center text-gray-500">Nenhum link customizado cadastrado.</td></tr>
                  ) : customLinks.map(link => (
                    <tr key={link.tmdb_id} className="hover:bg-gray-800/50 transition">
                      <td className="p-4 font-medium">{link.title}</td>
                      <td className="p-4 capitalize text-gray-400">{link.media_type}</td>
                      <td className="p-4 text-xs text-blue-400 truncate max-w-xs">{link.url}</td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleDeleteLink(link.tmdb_id)}
                          className="text-red-600 hover:text-red-400 p-2"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden shadow-xl">
              <div className="p-6 border-b border-gray-800 bg-black/40">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <CreditCard className="text-red-600" />
                  Gerenciar Valores dos Planos
                </h3>
                <p className="text-sm text-gray-500 mt-1">Atualize os preços que aparecem para os usuários na página de assinatura.</p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plans.map((plan) => (
                    <div key={plan.id} className="bg-black/60 p-6 rounded-xl border border-gray-800 hover:border-red-600/50 transition group">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-bold text-gray-300">{plan.name}</h4>
                        <button 
                          onClick={() => {
                            setEditingPlan(plan.id);
                            setPlanForm({ price: plan.price });
                          }}
                          className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-full transition"
                        >
                          <Edit2 size={18} />
                        </button>
                      </div>

                      {editingPlan === plan.id ? (
                        <div className="space-y-4 animate-in zoom-in-95 duration-200">
                          <div>
                            <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Preço Mensal (R$)</label>
                            <input 
                              type="number" 
                              step="0.01"
                              className="w-full bg-gray-900 border border-red-600 rounded px-3 py-2 text-xl font-bold outline-none"
                              value={planForm.price}
                              onChange={(e) => setPlanForm({ price: parseFloat(e.target.value) })}
                              autoFocus
                            />
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleUpdatePlan(plan.id)}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded flex items-center justify-center gap-2 transition"
                            >
                              <Check size={18} /> Salvar
                            </button>
                            <button 
                              onClick={() => setEditingPlan(null)}
                              className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-4 py-2 rounded transition"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-3xl font-black text-white">
                            R$ {plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 italic">cobrado mensalmente</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-blue-900/10 border border-blue-500/20 p-6 rounded-lg flex gap-4 items-start">
              <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                <LayoutDashboard size={24} />
              </div>
              <div>
                <h4 className="font-bold text-blue-400">Dica de Administrador</h4>
                <p className="text-sm text-gray-400 mt-1">
                  Os valores alterados aqui refletem instantaneamente na página de planos para novos assinantes. 
                  Lembre-se de que alterações de preço não afetam assinaturas já existentes (se houver integração de pagamento real).
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
