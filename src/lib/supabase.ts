
// Mock Supabase client and functions for development
console.log('Using mock Supabase client for development');

export const supabase = {
  auth: {
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    signOut: async () => ({ error: null }),
  },
};

// Mock auth helper functions
export const signUpWithEmail = async (email: string, password: string, metadata?: { full_name?: string }) => {
  console.log('Mock signup with:', { email, password, metadata });
  return { data: { user: { id: 'mock-id', email } }, error: null };
};

export const signInWithEmail = async (email: string, password: string) => {
  console.log('Mock sign in with:', { email, password });
  return { data: { user: { id: 'mock-id', email } }, error: null };
};

export const signInWithGoogle = async () => {
  console.log('Mock sign in with Google');
  return { data: {}, error: null };
};

export const signInWithMicrosoft = async () => {
  console.log('Mock sign in with Microsoft');
  return { data: {}, error: null };
};

export const signInWithApple = async () => {
  console.log('Mock sign in with Apple');
  return { data: {}, error: null };
};

export const signOut = async () => {
  console.log('Mock sign out');
  return { error: null };
};

export const getCurrentUser = async () => {
  console.log('Mock get current user');
  return { user: { id: 'mock-id', email: 'user@example.com' }, error: null };
};

export const getSession = async () => {
  console.log('Mock get session');
  return { session: { user: { id: 'mock-id' } }, error: null };
};
