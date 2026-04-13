import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  plan: 'basic' | 'standard' | 'premium' | null;
  profiles: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔥 BUSCAR OU CRIAR PROFILE NO FIRESTORE
  const fetchUserProfile = async (userId: string, email?: string) => {
    try {
      const docRef = doc(db, 'profiles', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        const newProfile = {
          id: userId,
          email: email || '',
          role: (email === 'rafael2019rg@gmail.com' || email?.includes('admin')) ? 'admin' : 'user',
          plan: null,
          profiles: ['Meu Perfil'],
          createdAt: new Date().toISOString()
        };
        await setDoc(docRef, newProfile);
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
      } else {
        setUser(null);
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
      await signOut(auth);
      setUser(null);
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
      value={{ user, loading, login, signup, logout, updateUser }}
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
