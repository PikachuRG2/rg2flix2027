import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  plan: 'basic' | 'standard' | 'premium' | null;
  profiles: string[];
}

export interface UserSession {
  id: string;
  user_id: string;
  device_name: string;
  device_type?: string;
  last_active: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  sessions: UserSession[];
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  removeSession: (sessionId: string) => Promise<void>;
  getCurrentSessionId: () => string | null;
  getTrialStartDate: () => Date | null;
  hasTrialAccess: () => boolean;
  getRemainingTime: () => number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'rafael2019rg@gmail.com';

// Função para detectar nome do dispositivo
const getDeviceName = (): string => {
  const userAgent = navigator.userAgent;
  let deviceName = 'Dispositivo Desconhecido';

  if (userAgent.includes('iPhone')) {
    deviceName = 'iPhone';
  } else if (userAgent.includes('iPad')) {
    deviceName = 'iPad';
  } else if (userAgent.includes('Android')) {
    deviceName = 'Android';
  } else if (userAgent.includes('Mac')) {
    deviceName = 'Mac';
  } else if (userAgent.includes('Windows')) {
    deviceName = 'Windows';
  } else if (userAgent.includes('Linux')) {
    deviceName = 'Linux';
  }

  const browser = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'].find(b => userAgent.includes(b));
  if (browser) {
    deviceName += ` (${browser})`;
  }

  return deviceName;
};

// Função para detectar tipo de dispositivo
const getDeviceType = (): string => {
  const userAgent = navigator.userAgent;

  if (userAgent.includes('Mobile') || userAgent.includes('Android')) {
    return 'mobile';
  } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
    return 'tablet';
  }

  return 'desktop';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // 🔥 BUSCAR SESSÕES DO USUÁRIO (FIRESTORE)
  const fetchUserSessions = async (userId: string) => {
    try {
      const sessionsRef = collection(db, 'user_sessions');
      const q = query(sessionsRef, where('user_id', '==', userId));
      const snapshot = await getDocs(q);
      const list = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() } as UserSession))
        .sort((a, b) => (b.last_active || '').localeCompare(a.last_active || ''));
      setSessions(list);
    } catch (err) {
      console.error('Erro ao buscar sessões:', err);
      setSessions([]);
    }
  };

  // 🔥 CRIAR/ATUALIZAR SESSÃO ATUAL (um documento por dispositivo)
  const createCurrentSession = async (userId: string) => {
    try {
      const deviceName = getDeviceName();
      const deviceType = getDeviceType();
      const sessionId = `${userId}_${deviceType}`;
      const sessionRef = doc(db, 'user_sessions', sessionId);
      const snap = await getDoc(sessionRef);

      await setDoc(sessionRef, {
        user_id: userId,
        device_name: deviceName,
        device_type: deviceType,
        last_active: new Date().toISOString(),
        created_at: snap.exists() ? snap.data().created_at : new Date().toISOString(),
      }, { merge: true });

      setCurrentSessionId(sessionId);
      await fetchUserSessions(userId);
    } catch (err) {
      console.error('Erro ao criar sessão:', err);
    }
  };

  // 🔥 REMOVER SESSÃO
  const removeSession = async (sessionId: string) => {
    try {
      await deleteDoc(doc(db, 'user_sessions', sessionId));
      if (user) {
        await fetchUserSessions(user.id);
      }
    } catch (err) {
      console.error('Erro ao remover sessão:', err);
    }
  };

  const getCurrentSessionId = () => currentSessionId;

  // 🔥 PERÍODO DE TESTE (24h de TV grátis)
  const getTrialStartDate = (): Date | null => {
    if (!user) return null;
    const stored = localStorage.getItem(`trial_start_${user.id}`);
    return stored ? new Date(stored) : null;
  };

  const hasTrialAccess = (): boolean => {
    if (!user) return false;

    // Admins sempre tem acesso
    if (user.role === 'admin' || user.email === ADMIN_EMAIL) return true;
    // Usuários com plano premium/basic tem acesso
    if (user.plan === 'premium' || user.plan === 'basic') return true;

    // Verificar período de teste para standard
    const trialStart = getTrialStartDate();
    if (!trialStart) {
      // Se não tem data de início, inicia o período de teste agora
      localStorage.setItem(`trial_start_${user.id}`, new Date().toISOString());
      return true;
    }

    // Verificar se ainda está dentro do período de 24h
    const now = new Date();
    const diff = now.getTime() - trialStart.getTime();
    const hoursDiff = diff / (1000 * 60 * 60);

    return hoursDiff < 24;
  };

  const getRemainingTime = (): number => {
    if (!user) return 0;

    const trialStart = getTrialStartDate();
    if (!trialStart) return 24 * 60 * 60 * 1000; // 24h em ms

    const now = new Date();
    const elapsed = now.getTime() - trialStart.getTime();
    const remaining = 24 * 60 * 60 * 1000 - elapsed;

    return Math.max(0, remaining);
  };

  // 🔥 BUSCAR OU CRIAR PROFILE NO FIRESTORE
  const fetchUserProfile = async (userId: string, email?: string) => {
    try {
      const docRef = doc(db, 'profiles', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        // Garante que o e-mail admin sempre tenha role admin, mesmo se o perfil já existir como 'user'
        if (email === ADMIN_EMAIL && data.role !== 'admin') {
          try {
            await updateDoc(docRef, { role: 'admin' });
            return { ...data, role: 'admin' };
          } catch (e) {
            console.error('Erro ao promover admin:', e);
          }
        }
        return data;
      } else {
        const newProfile = {
          id: userId,
          email: email || '',
          role: email === ADMIN_EMAIL ? 'admin' : 'user',
          plan: null,
          profiles: ['Meu Perfil'],
          createdAt: new Date().toISOString()
        };
        await setDoc(docRef, newProfile);
        // Iniciar o período de teste de 24h ao criar o perfil
        localStorage.setItem(`trial_start_${userId}`, new Date().toISOString());
        return newProfile;
      }
    } catch (error) {
      console.error('Erro ao buscar/criar profile:', error);
      return null;
    }
  };

  // 🔥 ESCUTAR MUDANÇAS NA AUTENTICAÇÃO
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const email = (firebaseUser.email || '').toLowerCase();
        const profile = await fetchUserProfile(firebaseUser.uid, email);

        const newUser: User = {
          id: firebaseUser.uid,
          email,
          role: profile?.role || 'user',
          plan: profile?.plan || null,
          profiles: profile?.profiles || ['Meu Perfil'],
        };
        setUser(newUser);
        await createCurrentSession(firebaseUser.uid);
      } else {
        setUser(null);
        setSessions([]);
        setCurrentSessionId(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🔥 LOGIN
  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      setLoading(false);
      throw error;
    }
    setLoading(false);
  };

  // 🔥 SIGNUP
  const signup = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      setLoading(false);
      throw error;
    }
    setLoading(false);
  };

  // 🔥 LOGOUT
  const logout = async () => {
    try {
      if (currentSessionId) {
        await deleteDoc(doc(db, 'user_sessions', currentSessionId)).catch(() => {});
      }
      await signOut(auth);
      setUser(null);
      setSessions([]);
      setCurrentSessionId(null);
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  // 🔥 UPDATE LOCAL E REMOTO
  const updateUser = async (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
      try {
        const docRef = doc(db, 'profiles', user.id);
        await updateDoc(docRef, updates as any);
      } catch (error) {
        console.error('Erro ao atualizar profile remoto:', error);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        sessions,
        login,
        signup,
        logout,
        updateUser,
        removeSession,
        getCurrentSessionId,
        getTrialStartDate,
        hasTrialAccess,
        getRemainingTime
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
