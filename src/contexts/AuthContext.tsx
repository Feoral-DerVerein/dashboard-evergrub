
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useToast } from '@/components/ui/use-toast';

// Define User and Session types to replace the Supabase ones
interface User {
  id: string;
  email: string | undefined;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
  created_at?: string;
  email_confirmed_at?: string;
}

interface Session {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

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

// Mock user data
const mockUser: User = {
  id: 'mock-user-id',
  email: 'user@example.com',
  user_metadata: {
    full_name: 'Demo User',
    avatar_url: null
  },
  created_at: new Date().toISOString(),
  email_confirmed_at: null
};

const mockSession: Session = {
  user: mockUser,
  access_token: 'mock-token',
  refresh_token: 'mock-refresh-token',
  expires_at: Date.now() + 3600000
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching session and user data
    const fetchUserAndSession = async () => {
      try {
        // Simulate a small delay to mimic network request
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setSession(mockSession);
        setUser(mockUser);
        
        toast({
          title: "Demo Mode",
          description: "Using mock authentication",
        });
      } catch (error) {
        console.error('Error in mock auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndSession();

    // No cleanup needed for mock implementation
    return () => {};
  }, [toast]);

  const value = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
