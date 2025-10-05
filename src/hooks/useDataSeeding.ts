import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

interface ClearDataResponse {
  success: boolean;
  message: string;
  deleted: {
    salesRecords: number;
    sustainabilityRecords: number;
    customerRecords: number;
    surpriseBags: number;
  };
}

export const useDataSeeding = () => {
  const queryClient = useQueryClient();

  const seedData = useMutation({
    mutationFn: async ({ days = 30, clearExisting = false }: SeedDataParams = {}) => {
      const { data, error } = await supabase.functions.invoke('seed-test-data', {
        body: { days, clearExisting },
      });

      if (error) throw error;
      return data as SeedResponse;
    },
    onSuccess: (data) => {
      toast.success(data.message, {
        description: `Generated ${data.stats.salesRecords} sales records, ${data.stats.sustainabilityRecords} sustainability records, ${data.stats.customerRecords} customer records, and ${data.stats.surpriseBags} surprise bags.`,
      });
      
      // Invalidate all metric queries to refetch with new data
      queryClient.invalidateQueries({ queryKey: ['sales-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['sustainability-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['customer-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['surprise-bags-metrics'] });
    },
    onError: (error: Error) => {
      toast.error('Failed to seed data', {
        description: error.message,
      });
    },
  });

  const clearData = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Delete all test data for the current user
      const [salesResult, sustainabilityResult, customerResult, bagsResult] = await Promise.all([
        supabase.from('sales_metrics').delete().eq('user_id', user.id),
        supabase.from('sustainability_metrics').delete().eq('user_id', user.id),
        supabase.from('customer_metrics').delete().eq('user_id', user.id),
        supabase.from('surprise_bags_metrics').delete().eq('user_id', user.id),
      ]);

      // Check for errors
      const errors = [salesResult, sustainabilityResult, customerResult, bagsResult]
        .filter(r => r.error)
        .map(r => r.error);
      
      if (errors.length > 0) {
        throw new Error('Failed to delete some data');
      }

      return {
        success: true,
        message: 'Test data cleared successfully',
        deleted: {
          salesRecords: 0,
          sustainabilityRecords: 0,
          customerRecords: 0,
          surpriseBags: 0,
        },
      } as ClearDataResponse;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      
      // Invalidate all metric queries
      queryClient.invalidateQueries({ queryKey: ['sales-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['sustainability-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['customer-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['surprise-bags-metrics'] });
    },
    onError: (error: Error) => {
      toast.error('Failed to clear data', {
        description: error.message,
      });
    },
  });

  return {
    seedData,
    clearData,
    isSeeding: seedData.isPending,
    isClearing: clearData.isPending,
  };
};
