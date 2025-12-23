/**
 * Unified Dashboard Types
 * Central type definitions for all dashboard data
 */

export type UserRole = 'admin' | 'manager' | 'staff';

export interface UserProfile {
    uid: string;
    email: string;
    role: UserRole;
    location_nick?: string; // Assigned location for managers/staff
    displayName?: string;
    photoURL?: string;
}

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
    lastSync: Date | null | string;
    location_nick?: string;
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

export interface SalesHistoryItem {
    date: string;
    actual: number;
    forecast: number;
    confidence: number;
}

export interface StockCategoryItem {
    category: string;
    inStock: number;
    lowStock: number;
    outOfStock: number;
}

export interface DashboardData {
    kpiMetrics: KPIMetrics;
    integrations: Integration[];
    salesStats: SalesStats;
    inventoryStats: InventoryStats;
    salesHistory: SalesHistoryItem[];
    stockByCategory: StockCategoryItem[];
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
    productId: number | string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    taxRate?: number; // e.g. 21 for 21% IVA
}

export interface TaxItem {
    taxRate: number;
    taxBase: number;
    taxAmount: number;
}

export interface Invoice {
    id: string;
    invoiceNumber: string; // e.g. F2023-0001
    date: Date;
    dueDate?: Date;
    customerId?: string;
    customerName: string;
    customerTaxId: string; // NIF/CIF
    items: POSItem[];
    taxDetails: TaxItem[];
    totalTaxableAmount: number;
    totalTaxAmount: number;
    totalAmount: number;
    status: 'draft' | 'issued' | 'paid' | 'cancelled';
    isFacturaEGenerated: boolean;
    xmlSegment?: string; // Simplified segment for storage
    digitalSignature?: string; // Mock signature hash
}

export interface PurchaseOrderItem {
    productId: string | number;
    name: string;
    suggestedQuantity: number;
    estimatedPrice: number;
}

export interface PurchaseOrder {
    id: string;
    date: Date;
    supplierId?: string;
    supplierName: string;
    items: PurchaseOrderItem[];
    totalEstimatedAmount: number;
    status: 'draft' | 'pending' | 'approved' | 'rejected';
    aiRationale: string;
}
