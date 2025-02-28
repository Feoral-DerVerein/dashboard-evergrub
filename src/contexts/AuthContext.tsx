
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, getCurrentUser, getSession } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserAndSession = async () => {
      try {
        const { session: currentSession } = await getSession();
        const { user: currentUser } = await getCurrentUser();
        
        setSession(currentSession);
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching user or session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        if (currentSession?.user) {
          setUser(currentSession.user);
          if (event === 'SIGNED_IN') {
            toast({
              title: "Welcome back!",
              description: `Signed in as ${currentSession.user.email}`,
            });
          }
        } else {
          setUser(null);
          if (event === 'SIGNED_OUT') {
            toast({
              title: "Signed out",
              description: "You have been signed out successfully",
            });
          }
        }
        setIsLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [toast]);

  const value = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
