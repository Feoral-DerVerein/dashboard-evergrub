/**
 * Unified Dashboard Service
 * 
 * Single source of truth for all dashboard data.
 * Combines data from Supabase (sales, products) with integration status
 * and calculates real-time KPI metrics.
 */

import { supabase } from '@/integrations/supabase/client';
import type { KPIMetrics, Integration, SalesStats, InventoryStats, DashboardData } from '@/types/dashboard';
import { Package, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';

export class UnifiedDashboardService {
    /**
     * Fetch all dashboard data
     */
    static async fetchDashboardData(userId: string): Promise<DashboardData> {
        try {
            const [salesStats, inventoryStats, integrations, donationStats] = await Promise.all([
                this.fetchSalesStats(userId),
                this.fetchInventoryStats(userId),
                this.fetchIntegrations(userId),
                this.fetchDonationStats(userId),
            ]);

            const kpiMetrics = this.calculateKPIMetrics(salesStats, inventoryStats, donationStats);

            return {
                kpiMetrics,
                integrations,
                salesStats,
                inventoryStats,
                lastUpdated: new Date(),
                isLoading: false,
                error: null,
            };
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    }

    // ... (existing methods)

    /**
     * Fetch donation statistics
     */
    private static async fetchDonationStats(userId: string): Promise<{ totalQuantity: number }> {
        try {
            const { data: donations, error } = await supabase
                .from('donations')
                .select('quantity')
                .eq('tenant_id', userId);

            if (error) throw error;

            const totalQuantity = donations?.reduce((sum, d) => sum + (Number(d.quantity) || 0), 0) || 0;
            return { totalQuantity };
        } catch (error) {
            console.error('Error fetching donation stats:', error);
            return { totalQuantity: 0 };
        }
    }

    /**
     * Calculate KPI metrics from stats
     */
    private static calculateKPIMetrics(
        salesStats: SalesStats,
        inventoryStats: InventoryStats,
        donationStats: { totalQuantity: number }
    ): KPIMetrics {
        // Format currency
        const formatCurrency = (value: number) => {
            return new Intl.NumberFormat('en-AU', {
                style: 'currency',
                currency: 'AUD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(value);
        };

        // Calculate changes (mock for now - would compare with previous period)
        const inventoryChange = 2.5;
        const productsChange = -12;
        const wasteChange = 5;
        const riskChange = 3;
        const donationChange = 10; // Mock

        return {
            totalInventoryValue: {
                title: 'Total Inventory Value',
                value: formatCurrency(inventoryStats.totalInventoryValue),
                rawValue: inventoryStats.totalInventoryValue,
                change: `+${inventoryChange}%`,
                changePercentage: inventoryChange,
                trend: 'up',
                icon: 'DollarSign',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
                description: 'vs. last month',
            },
            activeProducts: {
                title: 'Active Products',
                value: inventoryStats.totalProducts.toString(),
                rawValue: inventoryStats.totalProducts,
                change: `${productsChange}`,
                changePercentage: productsChange,
                trend: 'down',
                icon: 'Package',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
                description: 'items in stock',
            },
            wasteReduction: {
                title: 'Waste Reduction',
                value: `${Math.round(inventoryStats.wasteReductionPercentage)}%`,
                rawValue: inventoryStats.wasteReductionPercentage,
                change: `+${wasteChange}%`,
                changePercentage: wasteChange,
                trend: 'up',
                icon: 'TrendingUp',
                color: 'text-green-600',
                bg: 'bg-green-50',
                description: 'efficiency rate',
            },
            atRiskItems: {
                title: 'At Risk Items',
                value: inventoryStats.expiringItems.toString(),
                rawValue: inventoryStats.expiringItems,
                change: `+${riskChange}`,
                changePercentage: riskChange,
                trend: 'down',
                icon: 'AlertTriangle',
                color: 'text-red-600',
                bg: 'bg-red-50',
                description: 'expiring soon',
            },
            donatedMeals: {
                title: 'Meals Donated',
                value: donationStats.totalQuantity.toString(),
                rawValue: donationStats.totalQuantity,
                change: `+${donationChange}%`,
                changePercentage: donationChange,
                trend: 'up',
                icon: 'Heart',
                color: 'text-pink-600',
                bg: 'bg-pink-50',
                description: 'total units donated',
            },
        };
    }

    /**
     * Subscribe to real-time updates
     */
    static subscribeToUpdates(
        userId: string,
        callback: (data: DashboardData) => void
    ) {
        const channel = supabase
            .channel('dashboard-updates')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'sales',
                    filter: `tenant_id=eq.${userId}`,
                },
                async () => {
                    console.log('Sales data changed, refreshing dashboard...');
                    const data = await this.fetchDashboardData(userId);
                    callback(data);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'products',
                    filter: `tenant_id=eq.${userId}`,
                },
                async () => {
                    console.log('Products data changed, refreshing dashboard...');
                    const data = await this.fetchDashboardData(userId);
                    callback(data);
                }
            )
            .subscribe();

        return channel;
    }
}
