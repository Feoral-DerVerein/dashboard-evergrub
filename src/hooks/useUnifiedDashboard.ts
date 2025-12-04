/**
 * Unified Dashboard Hook
 * 
 * Custom hook for consuming dashboard data with real-time updates
 */

import { useState, useEffect, useCallback } from 'react';
import { UnifiedDashboardService } from '@/services/unifiedDashboardService';
import type { DashboardData } from '@/types/dashboard';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export const useUnifiedDashboard = () => {
    const { user } = useAuth();
    const [data, setData] = useState<DashboardData>({
        kpiMetrics: {
            totalInventoryValue: {
                title: 'Total Inventory Value',
                value: '$0',
                change: '+0%',
                trend: 'up',
                icon: 'DollarSign',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
                description: 'vs. last month',
            },
            activeProducts: {
                title: 'Active Products',
                value: '0',
                change: '0',
                trend: 'up',
                icon: 'Package',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
                description: 'items in stock',
            },
            wasteReduction: {
                title: 'Waste Reduction',
                value: '0%',
                change: '+0%',
                trend: 'up',
                icon: 'TrendingUp',
                color: 'text-green-600',
                bg: 'bg-green-50',
                description: 'efficiency rate',
            },
            atRiskItems: {
                title: 'At Risk Items',
                value: '0',
                change: '+0',
                trend: 'down',
                icon: 'AlertTriangle',
                color: 'text-red-600',
                bg: 'bg-red-50',
                description: 'expiring soon',
            },
        },
        integrations: [],
        salesStats: {
            totalSales: 0,
            totalTransactions: 0,
            averageOrderValue: 0,
            totalRevenue: 0,
            totalProfit: 0,
        },
        inventoryStats: {
            totalProducts: 0,
            totalInventoryValue: 0,
            lowStockItems: 0,
            expiringItems: 0,
            wasteReductionPercentage: 0,
        },
        lastUpdated: new Date(),
        isLoading: true,
        error: null,
    });

    const fetchData = useCallback(async (showToast = false) => {
        if (!user?.id) {
            setData(prev => ({ ...prev, isLoading: false }));
            return;
        }

        try {
            setData(prev => ({ ...prev, isLoading: true, error: null }));

            const dashboardData = await UnifiedDashboardService.fetchDashboardData(user.id);

            setData({
                ...dashboardData,
                isLoading: false,
                error: null,
            });

            if (showToast) {
                toast.success('Dashboard data refreshed', {
                    description: `Updated at ${new Date().toLocaleTimeString()}`,
                });
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dashboard data';

            setData(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error : new Error(errorMessage),
            }));

            if (showToast) {
                toast.error('Failed to refresh dashboard', {
                    description: errorMessage,
                });
            }
        }
    }, [user?.id]);

    // Initial fetch
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Set up real-time subscription
    useEffect(() => {
        if (!user?.id) return;

        console.log('Setting up real-time dashboard updates for user:', user.id);

        const channel = UnifiedDashboardService.subscribeToUpdates(
            user.id,
            (newData) => {
                setData({
                    ...newData,
                    isLoading: false,
                    error: null,
                });
            }
        );

        return () => {
            console.log('Cleaning up dashboard subscription');
            channel.unsubscribe();
        };
    }, [user?.id]);

    // Manual refresh function
    const refreshData = useCallback(() => {
        fetchData(true);
    }, [fetchData]);

    return {
        kpiMetrics: data.kpiMetrics,
        integrations: data.integrations,
        salesStats: data.salesStats,
        inventoryStats: data.inventoryStats,
        lastUpdated: data.lastUpdated,
        isLoading: data.isLoading,
        error: data.error,
        refreshData,
    };
};
