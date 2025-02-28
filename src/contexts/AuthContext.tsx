
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
    console.log("AuthProvider initialized");
    
    const fetchUserAndSession = async () => {
      try {
        console.log("Fetching user and session...");
        const { session: currentSession } = await getSession();
        const { user: currentUser } = await getCurrentUser();
        
        console.log("Session fetched:", currentSession ? "Session exists" : "No session");
        console.log("User fetched:", currentUser ? "User exists" : "No user");
        
        setSession(currentSession);
        setUser(currentUser);
        
        if (currentUser) {
          console.log("User authenticated:", currentUser.email);
        }
      } catch (error) {
        console.error('Error fetching user or session:', error);
      } finally {
        setIsLoading(false);
        console.log("Auth loading completed");
      }
    };

    fetchUserAndSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event);
        setSession(currentSession);
        
        if (currentSession?.user) {
          setUser(currentSession.user);
          console.log("User in session:", currentSession.user.email);
          
          if (event === 'SIGNED_IN') {
            toast({
              title: "Welcome back!",
              description: `Signed in as ${currentSession.user.email}`,
            });
          }
        } else {
          setUser(null);
          console.log("No user in session");
          
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

  console.log("Auth context value:", { 
    hasUser: !!user, 
    hasSession: !!session, 
    isLoading, 
    isAuthenticated: !!user 
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
