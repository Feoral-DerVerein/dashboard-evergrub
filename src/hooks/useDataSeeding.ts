import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, writeBatch, doc, addDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { format, subDays } from 'date-fns';

interface SeedDataParams {
  days?: number;
  clearExisting?: boolean;
}

interface SeedResponse {
  success: boolean;
  message: string;
  stats: {
    salesRecords: number;
    sustainabilityRecords: number;
    customerRecords: number;
    surpriseBags: number;
  };
}

export const useDataSeeding = () => {
  const queryClient = useQueryClient();

  const clearDataFn = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const batch = writeBatch(db);
    const collections = ['sales_metrics', 'sustainability_metrics', 'customer_metrics', 'surprise_bags_metrics', 'grain_transactions'];
    let count = 0;

    for (const colName of collections) {
      const q = query(collection(db, colName), where('user_id', '==', user.uid));
      const snapshot = await getDocs(q);
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        count++;
      });
    }

    if (count > 0) {
      await batch.commit();
    }

    return { success: true, count };
  };

  const seedDataFn = async ({ days = 30 }: SeedDataParams) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    // Simple seeder logic
    // Generate daily metrics for last N days
    const batch = writeBatch(db);
    let salesCount = 0;

    // We'll just add one record per day for simplicity in this migration
    for (let i = 0; i < days; i++) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const idSuffix = `${user.uid}_${dateStr}`; // Unique-ish ID

      // Sales
      const salesRef = doc(collection(db, 'sales_metrics'));
      batch.set(salesRef, {
        user_id: user.uid,
        date: dateStr,
        total_sales: Math.floor(Math.random() * 1000) + 100,
        transactions: Math.floor(Math.random() * 50) + 10,
        profit: Math.floor(Math.random() * 500) + 50,
        created_at: new Date().toISOString()
      });
      salesCount++;

      // Sustainability
      const susRef = doc(collection(db, 'sustainability_metrics'));
      batch.set(susRef, {
        user_id: user.uid,
        date: dateStr,
        co2_saved: Math.random() * 10,
        waste_reduced: Math.random() * 5,
        food_waste_kg: Math.random() * 2,
        created_at: new Date().toISOString()
      });

      // Customer
      const custRef = doc(collection(db, 'customer_metrics'));
      batch.set(custRef, {
        user_id: user.uid,
        date: dateStr,
        conversion_rate: Math.random() * 5 + 1,
        return_rate: Math.random() * 2,
        avg_order_value: Math.floor(Math.random() * 50) + 20,
        created_at: new Date().toISOString()
      });
    }

    // Surprise Bags (just a few current ones)
    for (let i = 0; i < 5; i++) {
      const bagRef = doc(collection(db, 'surprise_bags_metrics'));
      batch.set(bagRef, {
        user_id: user.uid,
        status: 'available',
        discount_price: 5.99,
        created_at: new Date().toISOString()
      });
    }

    await batch.commit();

    return {
      success: true,
      message: 'Data seeded successfully (Client-side)',
      stats: {
        salesRecords: salesCount,
        sustainabilityRecords: salesCount,
        customerRecords: salesCount,
        surpriseBags: 5
      }
    };
  };

  const seedData = useMutation({
    mutationFn: async (params: SeedDataParams = {}) => {
      if (params.clearExisting) {
        await clearDataFn();
      }
      return seedDataFn(params);
    },
    onSuccess: (data) => {
      toast.success(data.message, {
        description: `Generated ${data.stats.salesRecords} daily records.`,
      });

      // Invalidate all metric queries
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
    onError: (error: Error) => {
      console.error("Seeding error", error);
      toast.error('Failed to seed data: ' + error.message);
    },
  });

  const clearData = useMutation({
    mutationFn: async () => {
      await clearDataFn();
      return { success: true, message: 'Data cleared' };
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
    onError: (error: Error) => {
      toast.error('Failed to clear data: ' + error.message);
    },
  });

  return {
    seedData,
    clearData,
    isSeeding: seedData.isPending,
    isClearing: clearData.isPending,
  };
};
