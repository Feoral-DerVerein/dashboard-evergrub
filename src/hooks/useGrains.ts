
import { useState, useEffect } from 'react';
import { grainService, UserGrainBalance, GrainTransaction } from '@/services/grainService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useGrains = () => {
  const [balance, setBalance] = useState<UserGrainBalance | null>(null);
  const [transactions, setTransactions] = useState<GrainTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await fetchUserData(user.id);
      }
      setLoading(false);
    };

    getCurrentUser();
  }, []);

  const fetchUserData = async (userIdParam: string) => {
    try {
      const [balanceData, transactionsData] = await Promise.all([
        grainService.getUserBalance(userIdParam),
        grainService.getUserTransactions(userIdParam)
      ]);

      setBalance(balanceData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error fetching user grain data:', error);
      toast({
        title: "Error",
        description: "Could not load grains data",
        variant: "destructive"
      });
    }
  };

  const refreshData = async () => {
    if (userId) {
      await fetchUserData(userId);
    }
  };

  const redeemGrains = async (grains: number) => {
    if (!userId) return;

    try {
      const cashValue = (grains / 2000) * 10; // 2000 grains = $10
      await grainService.redeemGrains(userId, grains, cashValue);
      await refreshData();
      
      toast({
        title: "Redemption successful!",
        description: `You redeemed ${grains} grains for $${cashValue.toFixed(2)}`,
      });
    } catch (error: any) {
      toast({
        title: "Redemption error",
        description: error.message || "Could not complete redemption",
        variant: "destructive"
      });
    }
  };

  const useGrainsForPurchase = async (grains: number, description: string, orderId?: string) => {
    if (!userId) return;

    try {
      await grainService.useGrainsForPurchase(userId, grains, description, orderId);
      await refreshData();
      
      toast({
        title: "Grains used",
        description: `You used ${grains} grains for: ${description}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not use grains",
        variant: "destructive"
      });
    }
  };

  return {
    balance,
    transactions,
    loading,
    refreshData,
    redeemGrains,
    useGrainsForPurchase
  };
};
