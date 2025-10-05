/**
 * Dashboard Data Hook
 * 
 * Manages fetching and refreshing dashboard data
 * Handles auto-refresh and manual refresh
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchAllDashboardData, DashboardMetrics } from '@/services/posApiService';
import { POS_API_CONFIG } from '@/config/posApiConfig';
import { toast } from 'sonner';

export const useDashboardData = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (showToast = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetchAllDashboardData();

      if (response.success && response.data) {
        setMetrics(response.data);
        setLastUpdated(response.timestamp);
        
        if (showToast) {
          toast.success('Data refreshed successfully', {
            description: POS_API_CONFIG.USE_MOCK_DATA 
              ? 'Using sample data' 
              : 'Connected to POS',
          });
        }
      } else {
        throw new Error(response.error || 'Failed to fetch data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
      setError(errorMessage);
      
      if (showToast) {
        toast.error('Failed to refresh data', {
          description: errorMessage,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh
  useEffect(() => {
    if (POS_API_CONFIG.AUTO_REFRESH_INTERVAL > 0) {
      const interval = setInterval(() => {
        fetchData();
      }, POS_API_CONFIG.AUTO_REFRESH_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [fetchData]);

  const refreshData = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  return {
    metrics,
    isLoading,
    lastUpdated,
    error,
    refreshData,
    isUsingMockData: POS_API_CONFIG.USE_MOCK_DATA,
  };
};
