
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, orderBy, limit } from 'firebase/firestore';

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
  // Get user balance
  async getUserBalance(userId: string): Promise<UserGrainBalance | null> {
    const q = query(collection(db, 'user_grain_balance'), where('user_id', '==', userId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as UserGrainBalance;
  },

  // Get transaction history
  async getUserTransactions(userId: string, limitVal = 50): Promise<GrainTransaction[]> {
    const q = query(
      collection(db, 'grain_transactions'),
      where('user_id', '==', userId),
      orderBy('created_at', 'desc'),
      limit(limitVal)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as GrainTransaction));
  },

  // Create earned grains transaction
  async addEarnedGrains(userId: string, amount: number, description: string, orderId?: string): Promise<GrainTransaction> {
    const tx = {
      user_id: userId,
      type: 'earned',
      amount,
      description,
      order_id: orderId,
      cash_value: 0,
      created_at: new Date().toISOString()
    };
    const ref = await addDoc(collection(db, 'grain_transactions'), tx);
    return { id: ref.id, ...tx } as GrainTransaction;
  },

  // Redeem grains for cash
  async redeemGrains(userId: string, grains: number, cashValue: number): Promise<GrainTransaction> {
    // Verify user has enough grains
    const balance = await this.getUserBalance(userId);
    if (!balance || balance.total_grains < grains) {
      throw new Error('Insufficient grains balance');
    }

    const tx = {
      user_id: userId,
      type: 'redeemed',
      amount: grains,
      description: `Redeemed ${grains} grains for $${cashValue.toFixed(2)}`,
      cash_value: cashValue,
      created_at: new Date().toISOString()
    };
    const ref = await addDoc(collection(db, 'grain_transactions'), tx);
    return { id: ref.id, ...tx } as GrainTransaction;
  },

  // Use grains for purchase
  async useGrainsForPurchase(userId: string, grains: number, description: string, orderId?: string): Promise<GrainTransaction> {
    // Verify user has enough grains
    const balance = await this.getUserBalance(userId);
    if (!balance || balance.total_grains < grains) {
      throw new Error('Insufficient grains balance');
    }

    const tx = {
      user_id: userId,
      type: 'purchased_with',
      amount: grains,
      description,
      order_id: orderId,
      cash_value: 0,
      created_at: new Date().toISOString()
    };
    const ref = await addDoc(collection(db, 'grain_transactions'), tx);
    return { id: ref.id, ...tx } as GrainTransaction;
  }
};
