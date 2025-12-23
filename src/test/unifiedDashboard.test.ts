import { describe, it, expect, vi } from 'vitest';
import { UnifiedDashboardService } from '../services/unifiedDashboardService';

// Mocking Lucide icons as they cause issues in Node/Vitest environment
vi.mock('lucide-react', () => ({
    Package: () => 'PackageIcon',
    AlertTriangle: () => 'AlertIcon',
    TrendingUp: () => 'TrendingIcon',
    DollarSign: () => 'DollarIcon',
    Heart: () => 'HeartIcon',
}));

describe('UnifiedDashboardService KPI Calculations', () => {
    it('should correctly calculate KPI metrics from raw stats', () => {
        const salesStats = {
            totalSales: 1000,
            totalTransactions: 10,
            averageOrderValue: 100,
            totalRevenue: 1000,
            totalProfit: 300,
        };

        const inventoryStats = {
            totalProducts: 50,
            totalInventoryValue: 5000,
            lowStockItems: 5,
            expiringItems: 2,
            wasteReductionPercentage: 30,
        };

        const donationStats = {
            totalQuantity: 100,
        };

        // Accessing private method via type casting for testing
        const metrics = (UnifiedDashboardService as any).calculateKPIMetrics(
            salesStats,
            inventoryStats,
            donationStats
        );

        // Verify Inventory Value
        expect(metrics.totalInventoryValue.rawValue).toBe(5000);
        expect(metrics.totalInventoryValue.value).toContain('€');

        // Verify Active Products
        expect(metrics.activeProducts.rawValue).toBe(50);
        expect(metrics.activeProducts.value).toBe('50');

        // Verify At Risk Items
        expect(metrics.atRiskItems.rawValue).toBe(2);
        expect(metrics.atRiskItems.value).toBe('2');

        // Verify Donated Meals
        expect(metrics.donatedMeals.rawValue).toBe(100);
        expect(metrics.donatedMeals.value).toBe('100');
    });

    it('should handle zero values gracefully', () => {
        const salesStats = { totalSales: 0, totalTransactions: 0, averageOrderValue: 0, totalRevenue: 0, totalProfit: 0 };
        const inventoryStats = { totalProducts: 0, totalInventoryValue: 0, lowStockItems: 0, expiringItems: 0, wasteReductionPercentage: 0 };
        const donationStats = { totalQuantity: 0 };

        const metrics = (UnifiedDashboardService as any).calculateKPIMetrics(
            salesStats,
            inventoryStats,
            donationStats
        );

        expect(metrics.totalInventoryValue.rawValue).toBe(0);
        expect(metrics.activeProducts.value).toBe('0');
        expect(metrics.donatedMeals.value).toBe('0');
    });
});
