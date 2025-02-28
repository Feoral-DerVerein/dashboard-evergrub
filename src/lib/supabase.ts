
// Mock Supabase client and auth functions
const mockUser = {
  id: 'mock-user-id',
  email: 'user@example.com',
  user_metadata: {
    full_name: 'Demo User'
  }
};

const mockSession = {
  user: mockUser,
  access_token: 'mock-token',
  refresh_token: 'mock-refresh-token',
  expires_at: Date.now() + 3600000
};

// Mock Auth helper functions
export const signUpWithEmail = async (email: string, password: string, metadata?: { full_name?: string }) => {
  console.log('Mock signup with:', { email, password, metadata });
  return { 
    data: { user: mockUser, session: mockSession }, 
    error: null 
  };
};

export const signInWithEmail = async (email: string, password: string) => {
  console.log('Mock signin with:', { email, password });
  return { 
    data: { user: mockUser, session: mockSession }, 
    error: null 
  };
};

export const signInWithGoogle = async () => {
  console.log('Mock Google signin');
  return { 
    data: { user: mockUser, session: mockSession }, 
    error: null 
  };
};

export const signInWithMicrosoft = async () => {
  console.log('Mock Microsoft signin');
  return { 
    data: { user: mockUser, session: mockSession }, 
    error: null 
  };
};

export const signInWithApple = async () => {
  console.log('Mock Apple signin');
  return { 
    data: { user: mockUser, session: mockSession }, 
    error: null 
  };
};

export const signOut = async () => {
  console.log('Mock signout');
  return { error: null };
};

export const getCurrentUser = async () => {
  console.log('Mock get current user');
  return { user: mockUser, error: null };
};

export const getSession = async () => {
  console.log('Mock get session');
  return { session: mockSession, error: null };
};

// Mock subscription for auth state changes
export const supabase = {
  auth: {
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // Simulate an initial auth state
      setTimeout(() => {
        callback('SIGNED_IN', mockSession);
      }, 100);
      
      return {
        data: {
          subscription: {
            unsubscribe: () => console.log('Mock unsubscribe from auth state changes')
          }
        }
      };
    },
    getUser: async () => ({ data: { user: mockUser }, error: null }),
    getSession: async () => ({ data: { session: mockSession }, error: null }),
    signUp: async (params: any) => ({ data: { user: mockUser, session: mockSession }, error: null }),
    signInWithPassword: async (params: any) => ({ data: { user: mockUser, session: mockSession }, error: null }),
    signInWithOAuth: async (params: any) => ({ data: { url: 'https://example.com/oauth' }, error: null }),
    signOut: async () => ({ error: null })
  }
};
