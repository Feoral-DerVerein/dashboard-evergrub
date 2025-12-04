/**
 * Unified Dashboard Types
 * Central type definitions for all dashboard data
 */

export interface KPIMetric {
    title: string;
    value: string | number;
    change: string;
    trend: 'up' | 'down';
    icon: string;
    color: string;
    bg: string;
    description: string;
    rawValue?: number;
    changePercentage?: number;
}

export interface KPIMetrics {
    totalInventoryValue: KPIMetric;
    activeProducts: KPIMetric;
    wasteReduction: KPIMetric;
    atRiskItems: KPIMetric;
    donatedMeals?: KPIMetric;
}

export interface Integration {
    id: string;
    name: string;
    provider: 'square' | 'deliverect' | 'custom' | 'weather' | 'commodities' | 'analytics';
    status: 'connected' | 'disconnected' | 'error' | 'active';
    lastSync: Date | null;
    icon?: string;
    color?: string;
    bg?: string;
}

export interface SalesStats {
    totalSales: number;
    totalTransactions: number;
    averageOrderValue: number;
    totalRevenue: number;
    totalProfit: number;
}

export interface InventoryStats {
    totalProducts: number;
    totalInventoryValue: number;
    lowStockItems: number;
    expiringItems: number;
    wasteReductionPercentage: number;
}

export interface DashboardData {
    kpiMetrics: KPIMetrics;
    integrations: Integration[];
    salesStats: SalesStats;
    inventoryStats: InventoryStats;
    lastUpdated: Date;
    isLoading: boolean;
    error: Error | null;
}

export interface POSTransaction {
    transactionId: string;
    timestamp: Date;
    items: POSItem[];
    totalAmount: number;
    paymentMethod: string;
    customerId?: string;
    tenantId: string;
}

export interface POSItem {
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}
