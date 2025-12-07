import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  profile: any | null; // Adding profile to context
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  refreshProfile: () => Promise<void>; // Expose refresh function
};

// Crear el contexto con un valor por defecto para evitar errores
const defaultAuthContext: AuthContextType = {
  session: null,
  user: null,
  loading: true,
  profile: null,
  signOut: async () => { },
  signInWithGoogle: async () => { },
  refreshProfile: async () => { },
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  useEffect(() => {
    console.log("AuthProvider: initializing");

    // Verificar primero si ya hay una sesión activa
    const getInitialSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log("Initial session check:", currentSession?.user?.email || "No session");
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Failsafe: force loading false after 5 seconds
    const timeout = setTimeout(() => {
      setLoading(prev => {
        if (prev) {
          console.warn("Auth loading timed out, forcing false");
          return false;
        }
        return prev;
      });
    }, 5000);

    // Configurar el detector de cambios de estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.email || "No session");

        // Sincronizar state con la sesión actual
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      console.log("AuthProvider: cleanup");
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const signOut = async () => {
    console.log("Signing out");
    await supabase.auth.signOut();
    setProfile(null);
  };

  const signInWithGoogle = async () => {
    console.log("Signing in with Google");
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard',
      },
    });
  };

  const value = {
    session,
    user,
    loading,
    profile,
    signOut,
    signInWithGoogle,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
