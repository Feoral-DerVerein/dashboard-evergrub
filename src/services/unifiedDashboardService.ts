/**
 * Unified Dashboard Service
 * 
 * Single source of truth for all dashboard data.
 * Combines data from Supabase (sales, products) with integration status
 * and calculates real-time KPI metrics.
 */

import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, getDocs, getDoc, doc } from 'firebase/firestore';
import type { KPIMetrics, Integration, SalesStats, InventoryStats, DashboardData } from '@/types/dashboard';
import { Package, AlertTriangle, TrendingUp, DollarSign, Heart } from 'lucide-react';

export class UnifiedDashboardService {
    /**
     * Fetch all dashboard data
     */
    static async fetchDashboardData(userId: string, scenario: 'base' | 'optimistic' | 'crisis' = 'base', locationFilter?: string): Promise<DashboardData> {
        console.log('🚀 fetchDashboardData START for userId:', userId, 'scenario:', scenario, 'location:', locationFilter);

        try {
            const [salesStats, inventoryStats, integrations, donationStats, salesHistory, stockByCategory] = await Promise.all([
                this.fetchSalesStats(userId, locationFilter),
                this.fetchInventoryStats(userId, locationFilter),
                this.fetchIntegrations(userId),
                this.fetchDonationStats(userId, locationFilter),
                this.fetchSalesHistory(userId, scenario, locationFilter),
                this.fetchStockByCategory(userId, locationFilter),
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
            console.error('❌ Error fetching dashboard data:', error);
            throw error;
        }
    }

    /**
     * Fetch sales statistics from Firestore
     */
    private static async fetchSalesStats(userId: string, locationFilter?: string): Promise<SalesStats> {
        try {
            let q = query(collection(db, "sales"), where("tenant_id", "==", userId));
            if (locationFilter) {
                q = query(q, where("location_nick", "==", locationFilter));
            }

            const snapshot = await getDocs(q);
            const sales = snapshot.docs.map(d => d.data());

            const totalSales = sales.reduce((acc, curr) => acc + (curr.total_price || 0), 0);
            const totalTransactions = sales.length;
            const averageOrderValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;

            return {
                totalSales,
                totalTransactions,
                averageOrderValue,
                totalRevenue: totalSales,
                totalProfit: totalSales * 0.3, // Estimated 30% margin
            };
        } catch (e) {
            return { totalSales: 0, totalTransactions: 0, averageOrderValue: 0, totalRevenue: 0, totalProfit: 0 };
        }
    }

    /**
     * Fetch inventory statistics from Firestore
     */
    private static async fetchInventoryStats(userId: string, locationFilter?: string): Promise<InventoryStats> {
        try {
            let q = query(collection(db, "products"), where("tenant_id", "==", userId));
            if (locationFilter) {
                q = query(q, where("location_nick", "==", locationFilter));
            }

            const snapshot = await getDocs(q);
            const products = snapshot.docs.map(d => d.data());

            const totalProducts = products.length;
            const totalInventoryValue = products.reduce((acc, curr) => acc + ((curr.price || 0) * (curr.quantity || 0)), 0);
            const lowStockItems = products.filter(p => p.quantity < 10).length;

            const now = new Date();
            const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
            const expiringItems = products.filter(p => p.expiration_date && p.expiration_date <= threeDaysFromNow).length;

            return {
                totalProducts,
                totalInventoryValue,
                lowStockItems,
                expiringItems,
                wasteReductionPercentage: 25, // Placeholder for calculated metric
            };
        } catch (e) {
            return { totalProducts: 0, totalInventoryValue: 0, lowStockItems: 0, expiringItems: 0, wasteReductionPercentage: 0 };
        }
    }

    /**
     * Fetch integrations
     */
    private static async fetchIntegrations(userId: string): Promise<Integration[]> {
        try {
            const docRef = doc(db, 'integrations', userId);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) return [];

            const data = docSnap.data();
            return Object.keys(data).map(key => ({
                id: key,
                name: key.charAt(0).toUpperCase() + key.slice(1),
                provider: key as any,
                status: (data[key].connected ? 'connected' : 'disconnected') as 'connected' | 'disconnected',
                icon: 'Package', // Use string icon name
                lastSync: data[key].lastSync || null,
                location_nick: data[key].location_nick
            }));
        } catch (e) {
            return [];
        }
    }

    /**
     * Fetch sales history for charts
     */
    private static async fetchSalesHistory(userId: string, scenario: string = 'base', locationFilter?: string): Promise<any[]> {
        // Sample data for chart
        return [
            { date: 'Lun', actual: 4500, forecast: null },
            { date: 'Mar', actual: 5200, forecast: null },
            { date: 'Mie', actual: 4800, forecast: null },
            { date: 'Jue', actual: 5500, forecast: null },
            { date: 'Vie', actual: 6200, forecast: null },
            { date: 'Sab', actual: null, forecast: 5800 },
            { date: 'Dom', actual: null, forecast: 5100 },
        ];
    }

    /**
     * Fetch stock by category from Firestore
     */
    private static async fetchStockByCategory(userId: string, locationFilter?: string): Promise<any[]> {
        try {
            let q = query(collection(db, "products"), where("tenant_id", "==", userId));
            if (locationFilter) {
                q = query(q, where("location_nick", "==", locationFilter));
            }

            const snapshot = await getDocs(q);
            const products = snapshot.docs.map(d => d.data());

            const categoryMap: Record<string, { inStock: number, lowStock: number, outOfStock: number }> = {};

            products.forEach(p => {
                const category = p.category || 'Otros';
                if (!categoryMap[category]) {
                    categoryMap[category] = { inStock: 0, lowStock: 0, outOfStock: 0 };
                }

                if (p.quantity <= 0) {
                    categoryMap[category].outOfStock += 1;
                } else if (p.quantity < 10) {
                    categoryMap[category].lowStock += 1;
                } else {
                    categoryMap[category].inStock += 1;
                }
            });

            return Object.keys(categoryMap).map(cat => ({
                category: cat,
                ...categoryMap[cat]
            }));
        } catch (e) {
            return [];
        }
    }

    /**
     * Fetch donation statistics
     */
    private static async fetchDonationStats(userId: string, locationFilter?: string): Promise<{ totalQuantity: number }> {
        try {
            let q = query(collection(db, "donations"), where("user_id", "==", userId));
            const snapshot = await getDocs(q);
            const total = snapshot.docs.reduce((acc, curr) => acc + (curr.data().quantity || 0), 0);
            return { totalQuantity: total };
        } catch (e) {
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
        // Format currency (local for Spain/EU context usually preferred, but using AUD as base from previous code)
        const formatCurrency = (value: number) => {
            return new Intl.NumberFormat('es-ES', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(value);
        };

        const inventoryChange = 2.5;
        const productsChange = 5;
        const wasteChange = 5;
        const riskChange = 2;
        const donationChange = 10;

        return {
            totalInventoryValue: {
                title: 'Valor Inventario',
                value: formatCurrency(inventoryStats.totalInventoryValue),
                rawValue: inventoryStats.totalInventoryValue,
                change: `+${inventoryChange}%`,
                changePercentage: inventoryChange,
                trend: 'up',
                icon: 'DollarSign',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
                description: 'este mes',
            },
            activeProducts: {
                title: 'Productos Activos',
                value: inventoryStats.totalProducts.toString(),
                rawValue: inventoryStats.totalProducts,
                change: `+${productsChange}`,
                changePercentage: productsChange,
                trend: 'up',
                icon: 'Package',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
                description: 'en stock',
            },
            wasteReduction: {
                title: 'Reducción Desperdicio',
                value: `${Math.round(inventoryStats.wasteReductionPercentage)}%`,
                rawValue: inventoryStats.wasteReductionPercentage,
                change: `+${wasteChange}%`,
                changePercentage: wasteChange,
                trend: 'up',
                icon: 'TrendingUp',
                color: 'text-green-600',
                bg: 'bg-green-50',
                description: 'tasa eficiencia',
            },
            atRiskItems: {
                title: 'Items en Riesgo',
                value: inventoryStats.expiringItems.toString(),
                rawValue: inventoryStats.expiringItems,
                change: `-${riskChange}%`,
                changePercentage: riskChange,
                trend: 'down',
                icon: 'AlertTriangle',
                color: 'text-red-600',
                bg: 'bg-red-50',
                description: 'vencen pronto',
            },
            donatedMeals: {
                title: 'Kits Donados',
                value: donationStats.totalQuantity.toString(),
                rawValue: donationStats.totalQuantity,
                change: `+${donationChange}%`,
                changePercentage: donationChange,
                trend: 'up',
                icon: 'Heart',
                color: 'text-pink-600',
                bg: 'bg-pink-50',
                description: 'total unidades',
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
        if (!userId) return () => { };

        console.log("Setting up Firestore subscriptions for dashboard updates");

        const qSales = query(collection(db, "sales"), where("tenant_id", "==", userId));
        const qProducts = query(collection(db, "products"), where("tenant_id", "==", userId));

        const unsubSales = onSnapshot(qSales, async (snapshot) => {
            if (snapshot.docChanges().length > 0) {
                console.log('Sales data changed, refreshing dashboard...');
                const data = await this.fetchDashboardData(userId);
                callback(data);
            }
        }, (err) => console.error("Sales sub error", err));

        const unsubProducts = onSnapshot(qProducts, async (snapshot) => {
            if (snapshot.docChanges().length > 0) {
                console.log('Products data changed, refreshing dashboard...');
                const data = await this.fetchDashboardData(userId);
                callback(data);
            }
        }, (err) => console.error("Products sub error", err));

        return () => {
            unsubSales();
            unsubProducts();
        };
    }
}
