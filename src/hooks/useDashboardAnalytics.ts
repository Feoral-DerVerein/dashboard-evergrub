import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardAnalyticsService, DashboardAnalytics } from '@/services/dashboardAnalyticsService';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export const useDashboardAnalytics = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Set up real-time subscription to products collection
  useEffect(() => {
    console.log('🔄 Setting up real-time sync for dashboard analytics');

    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot: any) => {
      // We don't need the data here, just the trigger to refetch analytics
      console.log('🔄 Product change detected, refreshing dashboard analytics');
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
    }, (error: any) => {
      console.error("Error in dashboard analytics subscription:", error);
    });

    return () => {
      console.log('🔌 Cleaning up dashboard analytics sync');
      unsubscribe();
    };
  }, [queryClient]);

  return useQuery<DashboardAnalytics>({
    queryKey: ['dashboard-analytics'],
    queryFn: () => dashboardAnalyticsService.fetchDashboardAnalytics(),
    enabled: !!user, // Only run query when user is authenticated
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
    retry: 2,
  });
};
