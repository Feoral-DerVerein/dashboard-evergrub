import { supabase } from '@/integrations/supabase/client';

/**
 * Servicio para manejar la actualización automática de tokens de Square
 */

export const refreshSquareToken = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🔵 Iniciando refresh de token de Square...');
    
    // Llamar al edge function para refrescar el token
    const { data, error } = await supabase.functions.invoke('square-refresh-token', {
      body: {},
    });

    if (error) {
      console.error('❌ Error al refrescar token:', error);
      return {
        success: false,
        error: error.message || 'Failed to refresh Square token',
      };
    }

    if (!data.success) {
      console.error('❌ El refresh falló:', data.error);
      return {
        success: false,
        error: data.error || 'Token refresh failed',
      };
    }

    console.log('✅ Token refrescado exitosamente');
    return { success: true };
  } catch (error) {
    console.error('❌ Error inesperado al refrescar token:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
};

/**
 * Verifica si el token necesita ser refrescado y lo hace automáticamente
 * Debe ser llamado antes de hacer peticiones importantes a Square API
 */
export const ensureValidSquareToken = async (): Promise<boolean> => {
  try {
    // Verificar si existe una conexión
    const { data: connection, error } = await supabase
      .from('square_connections')
      .select('id, connection_status')
      .single();

    if (error || !connection) {
      console.warn('⚠️ No se encontró conexión de Square');
      return false;
    }

    if (connection.connection_status !== 'connected') {
      console.warn('⚠️ Conexión de Square no está activa');
      return false;
    }

    console.log('✅ Token válido');
    return true;
  } catch (error) {
    console.error('❌ Error al verificar token:', error);
    return false;
  }
};
