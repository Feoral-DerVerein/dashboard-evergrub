// import { supabase } from '@/integrations/supabase/client'; // Removed
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  timestamp: string;
}

interface SalesMetrics {
  current: {
    totalSales: number;
    transactions: number;
    profit: number;
    revenue: number;
    avgOrderValue: number;
  };
  previous: {
    totalSales: number;
    transactions: number;
    profit: number;
    revenue: number;
    avgOrderValue: number;
  };
  changes: {
    totalSales: number;
    transactions: number;
    profit: number;
    revenue: number;
    avgOrderValue: number;
  };
  period: 'week' | 'month';
  timestamp: string;
}

interface SustainabilityMetrics {
  current: {
    co2Saved: number;
    wasteReduced: number;
    foodWasteKg: number;
    environmentalImpact: number;
  };
  previous: {
    co2Saved: number;
    wasteReduced: number;
    foodWasteKg: number;
    environmentalImpact: number;
  };
  changes: {
    co2Saved: number;
    wasteReduced: number;
    foodWasteKg: number;
    environmentalImpact: number;
  };
  period: 'week' | 'month';
  timestamp: string;
}

interface CustomerMetrics {
  current: {
    conversionRate: number;
    returnRate: number;
    avgOrderValue: number;
  };
  previous: {
    conversionRate: number;
    returnRate: number;
    avgOrderValue: number;
  };
  changes: {
    conversionRate: number;
    returnRate: number;
    avgOrderValue: number;
  };
  period: 'week' | 'month';
  timestamp: string;
}

interface SurpriseBagsMetrics {
  summary: {
    activeBags: number;
    totalRevenue: number;
    averageDiscount: number;
    upcomingPickups: number;
  };
  bags: Array<{
    id: string;
    storeName: string;
    originalPrice: number;
    discountPrice: number;
    items: string[];
    pickupTime: string | null;
    status: string;
    createdAt: string;
  }>;
  timestamp: string;
}

// Fetch sales metrics
export function useSalesMetrics(period: 'week' | 'month' = 'week') {
  return useQuery({
    queryKey: ['salesMetrics', period],
    queryFn: async () => {
      // Mock data pending Firebase Function
      await new Promise(r => setTimeout(r, 500));
      return {
        current: { totalSales: 15000, transactions: 120, profit: 5000, revenue: 15000, avgOrderValue: 125 },
        previous: { totalSales: 12000, transactions: 100, profit: 4000, revenue: 12000, avgOrderValue: 120 },
        changes: { totalSales: 25, transactions: 20, profit: 25, revenue: 25, avgOrderValue: 4.1 },
        period,
        timestamp: new Date().toISOString()
      } as SalesMetrics;

      /* 
      const { data, error } = await supabase.functions.invoke('get-sales-metrics', { body: { period } });
      if (error) throw error;
      return data as SalesMetrics;
      */
    },
    refetchInterval: 30000,
    staleTime: 20000,
  });
}

// Fetch sustainability metrics
export function useSustainabilityMetrics(period: 'week' | 'month' = 'week') {
  return useQuery({
    queryKey: ['sustainabilityMetrics', period],
    queryFn: async () => {
      // Mock data
      await new Promise(r => setTimeout(r, 500));
      return {
        current: { co2Saved: 150, wasteReduced: 45, foodWasteKg: 12, environmentalImpact: 85 },
        previous: { co2Saved: 120, wasteReduced: 30, foodWasteKg: 20, environmentalImpact: 70 },
        changes: { co2Saved: 25, wasteReduced: 50, foodWasteKg: -40, environmentalImpact: 21 },
        period,
        timestamp: new Date().toISOString()
      } as SustainabilityMetrics;
    },
    refetchInterval: 30000,
    staleTime: 20000,
  });
}

// Fetch customer metrics
export function useCustomerMetrics(period: 'week' | 'month' = 'week') {
  return useQuery({
    queryKey: ['customerMetrics', period],
    queryFn: async () => {
      // Mock data
      await new Promise(r => setTimeout(r, 500));
      return {
        current: { conversionRate: 3.5, returnRate: 1.2, avgOrderValue: 85 },
        previous: { conversionRate: 3.0, returnRate: 1.5, avgOrderValue: 80 },
        changes: { conversionRate: 16, returnRate: -20, avgOrderValue: 6.25 },
        period,
        timestamp: new Date().toISOString()
      } as CustomerMetrics;
    },
    refetchInterval: 30000,
    staleTime: 20000,
  });
}

// Fetch surprise bags metrics
export function useSurpriseBagsMetrics(status = 'available', limit = 10) {
  return useQuery({
    queryKey: ['surpriseBagsMetrics', status, limit],
    queryFn: async () => {
      // Mock data
      await new Promise(r => setTimeout(r, 500));
      return {
        summary: { activeBags: 5, totalRevenue: 150, averageDiscount: 60, upcomingPickups: 2 },
        bags: [],
        timestamp: new Date().toISOString()
      } as SurpriseBagsMetrics;
    },
    refetchInterval: 30000,
    staleTime: 20000,
  });
}

// Update metrics mutation
export function useUpdateMetrics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      type: 'sales' | 'sustainability' | 'customer' | 'surprise_bags';
      date?: string;
      data: Record<string, any>;
    }) => {
      // Mock update
      await new Promise(r => setTimeout(r, 500));
      return { success: true };
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries based on the type
      switch (variables.type) {
        case 'sales':
          queryClient.invalidateQueries({ queryKey: ['salesMetrics'] });
          break;
        case 'sustainability':
          queryClient.invalidateQueries({ queryKey: ['sustainabilityMetrics'] });
          break;
        case 'customer':
          queryClient.invalidateQueries({ queryKey: ['customerMetrics'] });
          break;
        case 'surprise_bags':
          queryClient.invalidateQueries({ queryKey: ['surpriseBagsMetrics'] });
          break;
      }
    },
  });
}
