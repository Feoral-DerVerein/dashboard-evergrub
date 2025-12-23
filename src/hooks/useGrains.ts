
import { useState, useEffect } from 'react';
import { grainService, UserGrainBalance, GrainTransaction } from '@/services/grainService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export const useGrains = () => {
  const [balance, setBalance] = useState<UserGrainBalance | null>(null);
  const [transactions, setTransactions] = useState<GrainTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        await fetchUserData(user.id);
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

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
    if (user) {
      await fetchUserData(user.id);
    }
  };

  const redeemGrains = async (grains: number) => {
    if (!user) return;

    try {
      const cashValue = (grains / 2000) * 10; // 2000 grains = $10
      await grainService.redeemGrains(user.id, grains, cashValue);
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
    if (!user) return;

    try {
      await grainService.useGrainsForPurchase(user.id, grains, description, orderId);
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
