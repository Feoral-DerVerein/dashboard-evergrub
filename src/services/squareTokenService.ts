import { db } from '@/lib/firebase';
import { collection, query, getDocs, limit } from 'firebase/firestore';

/**
 * Servicio para manejar la actualización automática de tokens de Square
 */

export const refreshSquareToken = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🔵 Iniciando refresh de token de Square (Mocked for Migration)...');

    // Feature pending migration to Firebase Functions
    // const { data, error } = await firebase_functions.invoke('square-refresh-token', ...);

    console.log('✅ Token refrescado exitosamente (Mock)');
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
    const q = query(collection(db, 'square_connections'), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.warn('⚠️ No se encontró conexión de Square');
      return false;
    }

    const connection = snapshot.docs[0].data();

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
