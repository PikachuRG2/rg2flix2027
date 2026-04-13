import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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

  // 🔥 BUSCAR OU CRIAR PROFILE
  const fetchUserProfile = async (userId: string, email?: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.log('Erro ao buscar profile:', error.message);
      return null;
    }

    if (!data) {
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            email: email || '',
            role: 'user',
            plan: null,
            profiles: ['Meu Perfil'],
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.log('Erro ao criar profile:', insertError.message);
        return null;
      }

      return newProfile;
    }

    return data;
  };

  // 🔥 VERIFICAR SESSÃO
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session?.user) {
        const email = (data.session.user.email || '').toLowerCase();

        const profile = await fetchUserProfile(
          data.session.user.id,
          email
        );

        const isAdminEmail =
          email === 'rafael2019rg@gmail.com' || email.includes('admin');

        const newUser: User = {
          id: data.session.user.id,
          email,
          role: (isAdminEmail || profile?.role === 'admin') ? 'admin' : 'user',
          plan: profile?.plan || null,
          profiles: profile?.profiles || ['Meu Perfil'],
        };

        setUser(newUser);
      }

      setLoading(false);
    };

    checkUser();
  }, []);

  // 🔥 LOGIN
  const login = async (email: string, pass: string) => {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) {
      setLoading(false);
      throw error;
    }

    if (data.user) {
      const userEmail = (data.user.email || '').toLowerCase();

      const profile = await fetchUserProfile(
        data.user.id,
        userEmail
      );

      const isAdminEmail =
        userEmail === 'rafael2019rg@gmail.com' ||
        userEmail.includes('admin');

      const newUser: User = {
        id: data.user.id,
        email: userEmail,
        role: (isAdminEmail || profile?.role === 'admin') ? 'admin' : 'user',
        plan: profile?.plan || null,
        profiles: profile?.profiles || ['Meu Perfil'],
      };

      setUser(newUser);
    }

    setLoading(false);
  };

  // 🔥 SIGNUP
  const signup = async (email: string, pass: string) => {
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password: pass,
    });

    if (error) {
      setLoading(false);
      throw error;
    }

    setLoading(false);
  };

  // 🔥 LOGOUT
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // 🔥 UPDATE LOCAL
  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
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
