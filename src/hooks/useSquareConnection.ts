import { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc
} from "firebase/firestore";
import { useAuth } from '@/context/AuthContext';

export interface SquareConnection {
  id: string; // usually userId for 1:1, or uuid
  user_id: string;
  application_id: string;
  access_token: string;
  location_id: string;
  location_name: string | null;
  connection_status: string;
  webhook_url: string | null;
  webhook_enabled: boolean;
  auto_sync_enabled: boolean;
  created_at: string;
  updated_at: string;
  last_tested_at: string | null;
}

export const useSquareConnection = () => {
  const { user } = useAuth();
  const [connection, setConnection] = useState<SquareConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConnection = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Assuming 1 connection per user, using userId as document ID is simplest
      // But preserving existing structure where ID might be different
      // For simplicity in migration, let's use userId as the doc ID for square_connections
      // This enforces 1 per user which is typical for this app

      const docRef = doc(db, 'square_connections', user.id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setConnection({ id: docSnap.id, ...docSnap.data() } as SquareConnection);
      } else {
        setConnection(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch connection');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnection();
  }, [user]);

  const saveConnection = async (credentials: {
    application_id: string;
    access_token: string;
    location_id: string;
  }) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const docRef = doc(db, 'square_connections', user.id);

      const newConnectionData = {
        user_id: user.id,
        application_id: credentials.application_id,
        access_token: credentials.access_token,
        location_id: credentials.location_id,
        connection_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Defaults
        webhook_enabled: false,
        auto_sync_enabled: false,
        webhook_url: null,
        location_name: null,
        last_tested_at: null
      };

      await setDoc(docRef, newConnectionData, { merge: true }); // Merge to keep existing fields if any

      // Fetch back to be sure
      const docSnap = await getDoc(docRef);
      const data = { id: docSnap.id, ...docSnap.data() } as SquareConnection;

      setConnection(data);
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to save connection');
    }
  };

  const updateConnectionStatus = async (status: string, locationName?: string) => {
    if (!connection || !user) return;

    try {
      const docRef = doc(db, 'square_connections', user.id);

      const updateData: any = {
        connection_status: status,
        last_tested_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (locationName) {
        updateData.location_name = locationName;
      }

      await updateDoc(docRef, updateData);

      // Update local state
      const updatedConnection = { ...connection, ...updateData };
      setConnection(updatedConnection);
      return updatedConnection;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const updateSettings = async (settings: {
    webhook_url?: string;
    webhook_enabled?: boolean;
    auto_sync_enabled?: boolean;
  }) => {
    if (!connection || !user) throw new Error('No connection found');

    try {
      const docRef = doc(db, 'square_connections', user.id);

      const settingsWithTime = {
        ...settings,
        updated_at: new Date().toISOString()
      };

      await updateDoc(docRef, settingsWithTime);

      const updatedConnection = { ...connection, ...settingsWithTime };
      setConnection(updatedConnection);
      return updatedConnection;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update settings');
    }
  };

  const disconnect = async () => {
    if (!connection || !user) return;

    try {
      const docRef = doc(db, 'square_connections', user.id);
      await deleteDoc(docRef);
      setConnection(null);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to disconnect');
    }
  };

  return {
    connection,
    loading,
    error,
    saveConnection,
    updateConnectionStatus,
    updateSettings,
    disconnect,
    refetch: fetchConnection,
  };
};
