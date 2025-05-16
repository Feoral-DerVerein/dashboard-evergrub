
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
};

// Crear el contexto con un valor por defecto para evitar errores
const defaultAuthContext: AuthContextType = {
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
  signInWithGoogle: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthProvider: initializing");
    
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.email || "No session");
        
        // Synchronize state with current session
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Only update loading state on initial auth state change
        if (loading && event === 'INITIAL_SESSION') {
          setLoading(false);
        }
      }
    );

    // Then check for existing session
    const getInitialSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log("Initial session check:", currentSession?.user?.email || "No session");
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        // Make sure we set loading to false even if there's an error
        setLoading(false);
      }
    };

    getInitialSession();
    
    return () => {
      console.log("AuthProvider: cleanup");
      subscription.unsubscribe();
    };
  }, [loading]);

  const signOut = async () => {
    console.log("Signing out");
    await supabase.auth.signOut();
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
    signOut,
    signInWithGoogle,
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
