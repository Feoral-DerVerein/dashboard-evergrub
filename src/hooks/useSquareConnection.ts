import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface SquareConnection {
  id: string;
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
      const { data, error } = await supabase
        .from('square_connections')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setConnection(data);
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
      const { data, error } = await supabase
        .from('square_connections')
        .upsert({
          user_id: user.id,
          application_id: credentials.application_id,
          access_token: credentials.access_token,
          location_id: credentials.location_id,
          connection_status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      setConnection(data);
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to save connection');
    }
  };

  const updateConnectionStatus = async (status: string, locationName?: string) => {
    if (!connection) return;

    try {
      const updateData: any = {
        connection_status: status,
        last_tested_at: new Date().toISOString(),
      };

      if (locationName) {
        updateData.location_name = locationName;
      }

      const { data, error } = await supabase
        .from('square_connections')
        .update(updateData)
        .eq('id', connection.id)
        .select()
        .single();

      if (error) throw error;
      setConnection(data);
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const updateSettings = async (settings: {
    webhook_url?: string;
    webhook_enabled?: boolean;
    auto_sync_enabled?: boolean;
  }) => {
    if (!connection) throw new Error('No connection found');

    try {
      const { data, error } = await supabase
        .from('square_connections')
        .update(settings)
        .eq('id', connection.id)
        .select()
        .single();

      if (error) throw error;
      setConnection(data);
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update settings');
    }
  };

  const disconnect = async () => {
    if (!connection) return;

    try {
      const { error } = await supabase
        .from('square_connections')
        .delete()
        .eq('id', connection.id);

      if (error) throw error;
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
