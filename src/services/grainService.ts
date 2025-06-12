
import { supabase } from "@/integrations/supabase/client";

export interface GrainTransaction {
  id: string;
  user_id: string;
  type: 'earned' | 'redeemed' | 'purchased_with';
  amount: number;
  description: string;
  order_id?: string;
  cash_value: number;
  created_at: string;
}

export interface UserGrainBalance {
  id: string;
  user_id: string;
  total_grains: number;
  lifetime_earned: number;
  lifetime_redeemed: number;
  cash_redeemed: number;
  updated_at: string;
}

export const grainService = {
  // Obtener balance del usuario
  async getUserBalance(userId: string): Promise<UserGrainBalance | null> {
    const { data, error } = await supabase
      .from('user_grain_balance')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user grain balance:', error);
      throw error;
    }

    return data;
  },

  // Obtener historial de transacciones
  async getUserTransactions(userId: string, limit = 50): Promise<GrainTransaction[]> {
    const { data, error } = await supabase
      .from('grain_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching grain transactions:', error);
      throw error;
    }

    return data || [];
  },

  // Crear transacción de puntos ganados
  async addEarnedGrains(userId: string, amount: number, description: string, orderId?: string): Promise<GrainTransaction> {
    const { data, error } = await supabase
      .from('grain_transactions')
      .insert({
        user_id: userId,
        type: 'earned',
        amount,
        description,
        order_id: orderId,
        cash_value: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding earned grains:', error);
      throw error;
    }

    return data;
  },

  // Canjear grains por dinero
  async redeemGrains(userId: string, grains: number, cashValue: number): Promise<GrainTransaction> {
    // Verificar que el usuario tenga suficientes grains
    const balance = await this.getUserBalance(userId);
    if (!balance || balance.total_grains < grains) {
      throw new Error('Insufficient grains balance');
    }

    const { data, error } = await supabase
      .from('grain_transactions')
      .insert({
        user_id: userId,
        type: 'redeemed',
        amount: grains,
        description: `Redeemed ${grains} grains for $${cashValue.toFixed(2)}`,
        cash_value: cashValue
      })
      .select()
      .single();

    if (error) {
      console.error('Error redeeming grains:', error);
      throw error;
    }

    return data;
  },

  // Usar grains para comprar
  async useGrainsForPurchase(userId: string, grains: number, description: string, orderId?: string): Promise<GrainTransaction> {
    // Verificar que el usuario tenga suficientes grains
    const balance = await this.getUserBalance(userId);
    if (!balance || balance.total_grains < grains) {
      throw new Error('Insufficient grains balance');
    }

    const { data, error } = await supabase
      .from('grain_transactions')
      .insert({
        user_id: userId,
        type: 'purchased_with',
        amount: grains,
        description,
        order_id: orderId,
        cash_value: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error using grains for purchase:', error);
      throw error;
    }

    return data;
  }
};
