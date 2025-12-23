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
    const { user, profile } = useAuth();
    const { t } = useTranslation();

    // ... (rest of state items)
    const [data, setData] = useState<DashboardData>({
        // ... (data structure stays same)
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
    const [selectedLocation, setSelectedLocation] = useState<string | undefined>(undefined);

    // RBAC: Auto-set location for managers and staff
    useEffect(() => {
        if (profile && (profile.role === 'manager' || profile.role === 'staff') && profile.location_nick) {
            setSelectedLocation(profile.location_nick);
        }
    }, [profile]);

    const fetchData = useCallback(async (scenario = activeScenario, location = selectedLocation, showToast = false) => {
        if (!user?.uid) {
            setData(prev => ({ ...prev, isLoading: false }));
            return;
        }

        // RBAC: Override location if not admin
        let finalLocation = location;
        if (profile && profile.role !== 'admin' && profile.location_nick) {
            finalLocation = profile.location_nick;
        }

        try {
            setData(prev => ({ ...prev, isLoading: true, error: null }));

            const dashboardData = await UnifiedDashboardService.fetchDashboardData(user.uid, scenario, finalLocation);

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
        }
    }, [user?.uid, profile, t]);

    // Initial fetch and on scenario/location change
    useEffect(() => {
        fetchData(activeScenario, selectedLocation);
    }, [activeScenario, selectedLocation, user?.uid, profile]);

    // Set up real-time subscription
    useEffect(() => {
        if (!user?.uid) return;

        const channel = UnifiedDashboardService.subscribeToUpdates(
            user.uid,
            async () => {
                fetchData(activeScenario, selectedLocation);
            }
        );

        return () => {
            if (typeof channel === 'function') {
                channel();
            }
        };
    }, [user?.uid, activeScenario, selectedLocation, profile, t]);

    // Manual refresh function
    const refreshData = useCallback(() => {
        fetchData(activeScenario, selectedLocation, true);
    }, [fetchData, activeScenario, selectedLocation]);

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
        selectedLocation,
        setSelectedLocation,
        userRole: profile?.role || 'staff',
    };
};
