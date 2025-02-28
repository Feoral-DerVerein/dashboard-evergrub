
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
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
  isLoading: false,
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Mock authentication for development
  useEffect(() => {
    // Set mock user data
    const mockUser = {
      id: 'mock-user-id',
      email: 'user@example.com',
    } as User;
    
    setUser(mockUser);
    setIsLoading(false);
    
    // Optional: Show toast for development
    toast({
      title: "Development mode",
      description: "Using mock authentication data",
    });
  }, [toast]);

  const value = {
    user,
    session,
    isLoading,
    isAuthenticated: true, // Always authenticated for development
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
