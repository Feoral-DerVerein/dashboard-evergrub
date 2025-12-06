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
import { useTranslation } from 'react-i18next';

export const useUnifiedDashboard = () => {
    const { user } = useAuth();
    const { t } = useTranslation();

    const [data, setData] = useState<DashboardData>({
        kpiMetrics: {
            totalInventoryValue: {
                title: t('dashboard.kpi.inventory_value'),
                value: '$0',
                change: '+0%',
                trend: 'up',
                icon: 'DollarSign',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
                description: t('dashboard.kpi.last_month'),
            },
            activeProducts: {
                title: t('dashboard.kpi.active_products'),
                value: '0',
                change: '0',
                trend: 'up',
                icon: 'Package',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
                description: t('dashboard.kpi.items_in_stock'),
            },
            wasteReduction: {
                title: t('dashboard.kpi.waste_reduction'),
                value: '0%',
                change: '+0%',
                trend: 'up',
                icon: 'TrendingUp',
                color: 'text-green-600',
                bg: 'bg-green-50',
                description: t('dashboard.kpi.efficiency_rate'),
            },
            atRiskItems: {
                title: t('dashboard.kpi.at_risk_items'),
                value: '0',
                change: '+0',
                trend: 'down',
                icon: 'AlertTriangle',
                color: 'text-red-600',
                bg: 'bg-red-50',
                description: t('dashboard.kpi.expiring_soon'),
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
        salesHistory: [],
        stockByCategory: [],
        lastUpdated: new Date(),
        isLoading: true,
        error: null,
    });

    const translateMetrics = (metrics: any) => {
        const translated = { ...metrics };
        if (translated.totalInventoryValue) {
            translated.totalInventoryValue.title = t('dashboard.kpi.inventory_value');
            translated.totalInventoryValue.description = t('dashboard.kpi.last_month');
        }
        if (translated.activeProducts) {
            translated.activeProducts.title = t('dashboard.kpi.active_products');
            translated.activeProducts.description = t('dashboard.kpi.items_in_stock');
        }
        if (translated.wasteReduction) {
            translated.wasteReduction.title = t('dashboard.kpi.waste_reduction');
            translated.wasteReduction.description = t('dashboard.kpi.efficiency_rate');
        }
        if (translated.atRiskItems) {
            translated.atRiskItems.title = t('dashboard.kpi.at_risk_items');
            translated.atRiskItems.description = t('dashboard.kpi.expiring_soon');
        }
        if (translated.donatedMeals) {
            translated.donatedMeals.title = t('dashboard.kpi.donated_meals');
            translated.donatedMeals.description = t('dashboard.kpi.units_donated');
        }
        return translated;
    };

    const [activeScenario, setActiveScenario] = useState<'base' | 'optimistic' | 'crisis'>('base');

    const fetchData = useCallback(async (scenario = activeScenario, showToast = false) => {
        if (!user?.id) {
            setData(prev => ({ ...prev, isLoading: false }));
            return;
        }

        try {
            setData(prev => ({ ...prev, isLoading: true, error: null }));

            const dashboardData = await UnifiedDashboardService.fetchDashboardData(user.id, scenario);

            // Translate Metrics Titles
            const translatedMetrics = translateMetrics(dashboardData.kpiMetrics);

            setData({
                ...dashboardData,
                kpiMetrics: translatedMetrics,
                isLoading: false,
                error: null,
            });

            if (showToast) {
                toast.success('Dashboard data refreshed', {
                    description: `Updated at ${new Date().toLocaleTimeString()} (${scenario} scenario)`,
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
    }, [user?.id, t]); // activeScenario excluded to prevent loop if passed as arg, but useEffect handles it

    // Initial fetch and on scenario change
    useEffect(() => {
        fetchData(activeScenario);
    }, [activeScenario, user?.id]); // Trigger when scenario changes

    // Set up real-time subscription
    useEffect(() => {
        if (!user?.id) return;

        console.log('Setting up real-time dashboard updates for user:', user.id);

        const channel = UnifiedDashboardService.subscribeToUpdates(
            user.id,
            async (newData) => {
                // When real-time update comes, we might want to respect current scenario or just base. 
                // Currently subscribeToUpdates fetches fresh data inside service using default (base).
                // Let's modify subscribeToUpdates in service if needed to accept scenario, or just re-fetch here.
                // Re-fetching here is cleaner.
                // Actually subscribeToUpdates callback passes data. 
                // We should probably just trigger fetchData(activeScenario) upon signal, 
                // but existing service logic does the fetching for us. 
                // Let's rely on manual refresh for now or deep fix service to respect scenario in callbacks.
                // For MVP, if real-time update comes, it refreshes base data usually.

                // Simple fix: If real-time event happens, re-fetch with current scenario
                // Ignoring the data passed by callback for now to ensure scenario consistency
                fetchData(activeScenario);
            }
        );

        return () => {
            console.log('Cleaning up dashboard subscription');
            channel.unsubscribe();
        };
    }, [user?.id, activeScenario, t]);

    // Manual refresh function
    const refreshData = useCallback(() => {
        fetchData(activeScenario, true);
    }, [fetchData, activeScenario]);

    // Force re-render/re-translation when language changes
    useEffect(() => {
        setData(prev => ({
            ...prev,
            kpiMetrics: translateMetrics(prev.kpiMetrics)
        }));
    }, [t]);

    return {
        kpiMetrics: data.kpiMetrics,
        integrations: data.integrations,
        salesStats: data.salesStats,
        inventoryStats: data.inventoryStats,
        salesHistory: data.salesHistory,
        stockByCategory: data.stockByCategory,
        lastUpdated: data.lastUpdated,
        isLoading: data.isLoading,
        error: data.error,
        refreshData,
        activeScenario,
        setScenario: setActiveScenario,
    };
};
