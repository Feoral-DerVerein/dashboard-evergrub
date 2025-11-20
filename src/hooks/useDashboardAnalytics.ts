import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardAnalyticsService, DashboardAnalytics } from '@/services/dashboardAnalyticsService';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const useDashboardAnalytics = () => {
  const queryClient = useQueryClient();
  const { user, session } = useAuth();

  // Set up real-time subscription to products table
  useEffect(() => {
    console.log('🔄 Setting up real-time sync for dashboard analytics');
    
    const channel = supabase
      .channel('dashboard-analytics-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          console.log('🔄 Product change detected, refreshing dashboard analytics:', payload.eventType);
          // Invalidate and refetch dashboard analytics when products change
          queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 Cleaning up dashboard analytics sync');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery<DashboardAnalytics>({
    queryKey: ['dashboard-analytics'],
    queryFn: () => dashboardAnalyticsService.fetchDashboardAnalytics(session?.access_token),
    enabled: !!user && !!session, // Only run query when user is authenticated
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
    retry: 2,
  });
};
