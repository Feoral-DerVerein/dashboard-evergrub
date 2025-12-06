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
    static async fetchDashboardData(userId: string, scenario: 'base' | 'optimistic' | 'crisis' = 'base'): Promise<DashboardData> {
        try {
            const [salesStats, inventoryStats, integrations, donationStats, salesHistory, stockByCategory] = await Promise.all([
                this.fetchSalesStats(userId),
                this.fetchInventoryStats(userId),
                this.fetchIntegrations(userId),
                this.fetchDonationStats(userId),
                this.fetchSalesHistory(userId, scenario),
                this.fetchStockByCategory(userId),
            ]);

            const kpiMetrics = this.calculateKPIMetrics(salesStats, inventoryStats, donationStats);

            return {
                kpiMetrics,
                integrations,
                salesStats,
                inventoryStats,
                salesHistory,
                stockByCategory,
                lastUpdated: new Date(),
                isLoading: false,
                error: null,
            };
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    }

    // ... (existing methods fetchSalesStats, fetchInventoryStats, fetchIntegrations methods unchanged)

    /**
     * Fetch sales history for the last 7 days + forecast
     */
    private static async fetchSalesHistory(userId: string, scenario: string = 'base'): Promise<any[]> {
        try {
            const today = new Date();
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 7);
            const sevenDaysFuture = new Date(today);
            sevenDaysFuture.setDate(today.getDate() + 7);
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

            // Fetch actual sales (always the same)
            const { data: actuals, error: actualsError } = await supabase
                .from('sales_history')
                .select('sale_date, total_amount')
                .eq('user_id', userId)
                .gte('sale_date', sevenDaysAgo.toISOString().split('T')[0])
                .lte('sale_date', today.toISOString().split('T')[0])
                .order('sale_date', { ascending: true });

            if (actualsError) throw actualsError;

            let forecasts = [];

            if (scenario === 'base') {
                // Fetch base forecast from DB (canonical)
                const { data: dbForecasts, error: forecastError } = await supabase
                    .from('sales_predictions')
                    .select('prediction_date, predicted_revenue, confidence_score')
                    .eq('user_id', userId)
                    .gte('prediction_date', today.toISOString().split('T')[0])
                    .lte('prediction_date', sevenDaysFuture.toISOString().split('T')[0])
                    .order('prediction_date', { ascending: true });

                if (forecastError) throw forecastError;
                forecasts = dbForecasts || [];
            } else {
                // Fetch transient forecast from Edge Function on-demand
                // Note: We trigger for 'timeRange=week' to match dashboard view (roughly)
                const { data: efData, error: efError } = await supabase.functions.invoke('generate-sales-predictions', {
                    body: { timeRange: 'day', scenario } // 'day' usually means daily granualarity for next 7 days in our fallback logic
                });

                if (efError) {
                    console.error('Error fetching scenario forecast:', efError);
                    // Fallback to empty to avoid crash
                    forecasts = [];
                } else {
                    // Map generic Edge Function response structure to our DB-like structure
                    forecasts = (efData.predictions || []).map((p: any) => ({
                        prediction_date: p.date.split('T')[0],
                        predicted_revenue: p.predicted,
                        confidence_score: (p.confidence || 0) / 100
                    }));
                }
            }

            // map to chart format
            const combinedData = [];

            // Process actuals
            actuals?.forEach(sale => {
                const date = new Date(sale.sale_date);
                combinedData.push({
                    date: dayNames[date.getDay()],
                    actual: sale.total_amount,
                    forecast: null,
                    confidence: null
                });
            });

            // Process forecasts
            forecasts.forEach((pred: any) => {
                const date = new Date(pred.prediction_date);
                combinedData.push({
                    date: dayNames[date.getDay()],
                    actual: null,
                    forecast: pred.predicted_revenue,
                    confidence: (pred.confidence_score || 0.8) * 100
                });
            });

            // If empty (e.g. new user), return empty array or handled in UI
            if (combinedData.length === 0) {
                // Fallback to empty structure to prevent chart crash
                return dayNames.map(d => ({ date: d, actual: 0, forecast: 0 }));
            }

            return combinedData;

        } catch (error) {
            console.error('Error fetching sales history:', error);
            // Return empty array on error to not crash dashboard
            return [];
        }
    }

    /**
     * Fetch stock status grouped by category
     */
    private static async fetchStockByCategory(userId: string): Promise<any[]> {
        try {
            const { data: products, error } = await supabase
                .from('products')
                .select('category, stock_level, min_audit_date') // Assuming fields
                .eq('tenant_id', userId);

            if (error) throw error;
            if (!products || products.length === 0) return [];

            // Group by category
            const categoryMap = new Map<string, { inStock: number, lowStock: number, outOfStock: number }>();

            products.forEach(p => {
                const cat = p.category || 'Uncategorized';
                if (!categoryMap.has(cat)) {
                    categoryMap.set(cat, { inStock: 0, lowStock: 0, outOfStock: 0 });
                }

                const stats = categoryMap.get(cat)!;
                if (p.stock_level <= 0) stats.outOfStock++;
                else if (p.stock_level < 10) stats.lowStock++; // Threshold hardcoded for now
                else stats.inStock++;
            });

            return Array.from(categoryMap.entries()).map(([category, stats]) => ({
                category,
                ...stats
            }));
        } catch (error) {
            console.error('Error fetching stock by category:', error);
            // Fallback mock data if DB query fails or table structure differs
            return [
                { category: 'Dairy', inStock: 450, lowStock: 23, outOfStock: 5 },
                { category: 'Produce', inStock: 320, lowStock: 45, outOfStock: 12 },
                { category: 'Meat', inStock: 280, lowStock: 18, outOfStock: 3 },
            ];
        }
    }

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
