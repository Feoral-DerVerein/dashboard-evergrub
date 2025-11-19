import { useQuery } from '@tanstack/react-query';
import { dashboardAnalyticsService, DashboardAnalytics } from '@/services/dashboardAnalyticsService';

export const useDashboardAnalytics = () => {
  return useQuery<DashboardAnalytics>({
    queryKey: ['dashboard-analytics'],
    queryFn: () => dashboardAnalyticsService.fetchDashboardAnalytics(),
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
    retry: 2,
  });
};
