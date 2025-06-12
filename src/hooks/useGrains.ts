
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
        description: "No se pudieron cargar los datos de grains",
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
        title: "¡Canje exitoso!",
        description: `Has canjeado ${grains} grains por $${cashValue.toFixed(2)}`,
      });
    } catch (error: any) {
      toast({
        title: "Error en el canje",
        description: error.message || "No se pudo completar el canje",
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
        title: "Grains utilizados",
        description: `Has usado ${grains} grains para: ${description}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron usar los grains",
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
