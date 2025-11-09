import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../config/supabase';
import { User, UserType } from '../types';
import { Session } from '@supabase/supabase-js';
import { registerForPushNotificationsAsync } from '../services/notifications';

interface AuthContextData {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, userType: UserType) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUserContext: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [pushRegistered, setPushRegistered] = useState(false);

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        loadUserData(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUser(data);
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signUp = async (email: string, password: string, name: string, userType: UserType) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      const now = new Date().toISOString();

      // Criar perfil do usuário
      const { error: profileError } = await supabase.from('users').insert({
        id: data.user.id,
        email,
        name,
        user_type: userType,
        created_at: now,
        updated_at: now,
      });

      if (profileError) throw profileError;

      if (userType === 'professional') {
        const { error: professionalError } = await supabase.from('professionals').insert({
          id: data.user.id,
          categories: [],
          regions: [],
          credits: 0,
          rating: 0,
          review_count: 0,
          portfolio: [],
          description: null,
          created_at: now,
          updated_at: now,
        });

        if (professionalError) {
          console.warn('Não foi possível criar dados adicionais do profissional:', professionalError);
        }
      }
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setPushRegistered(false);
  };

  const refreshUser = async () => {
    const targetId = session?.user?.id || user?.id;
    if (!targetId) return;
    await loadUserData(targetId);
  };

  const updateUserContext = (updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  useEffect(() => {
    let cancelled = false;
    if (user?.id && !pushRegistered) {
      registerForPushNotificationsAsync(user.id)
        .catch((err) => console.warn('Falha ao registar notificações:', err))
        .finally(() => {
          if (!cancelled) {
            setPushRegistered(true);
          }
        });
    }
    if (!user?.id && pushRegistered) {
      setPushRegistered(false);
    }

    return () => {
      cancelled = true;
    };
  }, [pushRegistered, user?.id]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        refreshUser,
        updateUserContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

