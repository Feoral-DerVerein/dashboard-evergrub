
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials are missing. Make sure to add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.');
}

// Verificando credenciales
console.log("Supabase URL exists:", !!supabaseUrl);
console.log("Supabase Anon Key exists:", !!supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Auth helper functions
export const signUpWithEmail = async (email: string, password: string, metadata?: { full_name?: string }) => {
  console.log("Attempting to sign up:", email);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  });
  return { data, error };
};

export const signInWithEmail = async (email: string, password: string) => {
  console.log("Attempting to sign in:", email);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) {
    console.error("Sign in error:", error.message);
  } else {
    console.log("Sign in successful");
  }
  return { data, error };
};

export const signInWithGoogle = async () => {
  console.log("Attempting to sign in with Google");
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`
    }
  });
  return { data, error };
};

export const signInWithMicrosoft = async () => {
  console.log("Attempting to sign in with Microsoft");
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'azure',
    options: {
      redirectTo: `${window.location.origin}/dashboard`
    }
  });
  return { data, error };
};

export const signInWithApple = async () => {
  console.log("Attempting to sign in with Apple");
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: `${window.location.origin}/dashboard`
    }
  });
  return { data, error };
};

export const signOut = async () => {
  console.log("Attempting to sign out");
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Error getting current user:", error.message);
      return { user: null, error };
    }
    return { user: data.user, error };
  } catch (e) {
    console.error("Exception in getCurrentUser:", e);
    return { user: null, error: e };
  }
};

export const getSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Error getting session:", error.message);
      return { session: null, error };
    }
    return { session: data.session, error };
  } catch (e) {
    console.error("Exception in getSession:", e);
    return { session: null, error: e };
  }
};
