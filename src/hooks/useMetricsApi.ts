import { supabase } from '@/integrations/supabase/client';
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
      const { data, error } = await supabase.functions.invoke('get-sales-metrics', {
        body: { period },
      });

      if (error) throw error;
      return data as SalesMetrics;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 20000,
  });
}

// Fetch sustainability metrics
export function useSustainabilityMetrics(period: 'week' | 'month' = 'week') {
  return useQuery({
    queryKey: ['sustainabilityMetrics', period],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-sustainability-metrics', {
        body: { period },
      });

      if (error) throw error;
      return data as SustainabilityMetrics;
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
      const { data, error } = await supabase.functions.invoke('get-customer-metrics', {
        body: { period },
      });

      if (error) throw error;
      return data as CustomerMetrics;
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
      const { data, error } = await supabase.functions.invoke('get-surprise-bags-metrics', {
        body: { status, limit },
      });

      if (error) throw error;
      return data as SurpriseBagsMetrics;
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
      const { data, error } = await supabase.functions.invoke('update-metrics', {
        body: params,
      });

      if (error) throw error;
      return data;
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
