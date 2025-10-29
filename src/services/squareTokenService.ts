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
    // Obtener conexión actual
    const { data: connection, error } = await supabase
      .from('square_connections')
      .select('token_expires_at')
      .single();

    if (error || !connection) {
      console.warn('⚠️ No se encontró conexión de Square');
      return false;
    }

    // Si no hay fecha de expiración, intentar refrescar por seguridad
    if (!connection.token_expires_at) {
      console.log('🔵 No hay fecha de expiración, refrescando token...');
      const result = await refreshSquareToken();
      return result.success;
    }

    // Verificar si el token expira en menos de 1 hora
    const expiresAt = new Date(connection.token_expires_at);
    const now = new Date();
    const oneHour = 60 * 60 * 1000;

    if (expiresAt.getTime() - now.getTime() < oneHour) {
      console.log('🔵 Token próximo a expirar, refrescando...');
      const result = await refreshSquareToken();
      return result.success;
    }

    console.log('✅ Token válido');
    return true;
  } catch (error) {
    console.error('❌ Error al verificar token:', error);
    return false;
  }
};
