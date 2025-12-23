import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { UserProfile, UserRole } from "@/types/dashboard";

// Compatible interface with existing usage
type AuthContextType = {
  user: User | null;
  loading: boolean;
  profile: UserProfile | null;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, data?: any) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
};

const defaultAuthContext: AuthContextType = {
  user: null,
  loading: true,
  profile: null,
  signOut: async () => { },
  signInWithGoogle: async () => { },
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  refreshProfile: async () => { },
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Initial load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await refreshProfile(currentUser.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const refreshProfile = async (uid?: string) => {
    const targetUid = uid || auth.currentUser?.uid;
    if (!targetUid) return;

    try {
      const docRef = doc(db, "profiles", targetUid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        // Create default profile if not exists
        console.warn("Profile not found in Firestore, creating default");
        const newProfile: UserProfile = {
          uid: targetUid,
          email: auth.currentUser?.email || '',
          role: 'admin' // Default to admin for now
        };
        await setDoc(docRef, newProfile);
        setProfile(newProfile);
      }
    } catch (error) {
      console.error("Error refreshing profile:", error);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const signUp = async (email: string, password: string, data?: any) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Create profile in Firestore
      if (data) {
        await setDoc(doc(db, "profiles", userCredential.user.uid), {
          ...data,
          email,
          created_at: new Date().toISOString()
        });
      }
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Google Login Error", error);
      alert("Error initiating Google Login: " + error.message);
    }
  };

  const value = {
    user,
    loading,
    profile,
    signOut,
    signInWithGoogle,
    signIn,
    signUp,
    refreshProfile: () => refreshProfile()
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
