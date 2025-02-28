
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
    console.log("AuthProvider mounting, fetching user and session...");
    const fetchUserAndSession = async () => {
      try {
        console.log("Fetching session...");
        const { session: currentSession } = await getSession();
        console.log("Session result:", currentSession);
        
        console.log("Fetching user...");
        const { user: currentUser } = await getCurrentUser();
        console.log("User result:", currentUser);
        
        setSession(currentSession);
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching user or session:', error);
      } finally {
        console.log("Setting isLoading to false");
        setIsLoading(false);
      }
    };

    fetchUserAndSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.email);
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
      console.log("Cleaning up auth listener");
      authListener?.subscription.unsubscribe();
    };
  }, [toast]);

  const value = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
  };

  console.log("AuthContext values:", { 
    isLoading, 
    isAuthenticated: !!user, 
    hasUser: !!user, 
    hasSession: !!session 
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
