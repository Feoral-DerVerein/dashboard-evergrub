import { describe, it, expect, vi } from 'vitest';
import { aiInsightsService } from '../services/aiInsightsService';
import { productService } from '../services/productService';

// Mock productService
vi.mock('../services/productService', () => ({
    productService: {
        getProductsByUser: vi.fn(),
    }
}));

describe('AIInsightsService Purchase Recommendations', () => {
    it('should suggest purchase orders when stock is low', async () => {
        const mockProducts = [
            { id: '1', name: 'Leche', quantity: 5, price: 1.2, brand: 'Pascual' },
            { id: '2', name: 'Huevos', quantity: 2, price: 2.5, brand: 'Granja' },
            { id: '3', name: 'Pan', quantity: 15, price: 0.8, brand: 'Bimbo' }, // Not low stock
        ];

        (productService.getProductsByUser as any).mockResolvedValue(mockProducts);

        const recommendations = await aiInsightsService.generatePurchaseRecommendations('test-user');

        // Should have 2 purchase orders (one per brand for low stock items)
        expect(recommendations.length).toBe(2);

        const pascualPO = recommendations.find(po => po.supplierName === 'Pascual');
        expect(pascualPO).toBeDefined();
        expect(pascualPO?.items[0].suggestedQuantity).toBe(45); // 50 - 5

        const granjaPO = recommendations.find(po => po.supplierName === 'Granja');
        expect(granjaPO).toBeDefined();
        expect(granjaPO?.items[0].suggestedQuantity).toBe(48); // 50 - 2
    });

    it('should return empty array if no stock is low', async () => {
        const mockProducts = [
            { id: '1', name: 'Leche', quantity: 20, price: 1.2, brand: 'Pascual' },
        ];

        (productService.getProductsByUser as any).mockResolvedValue(mockProducts);

        const recommendations = await aiInsightsService.generatePurchaseRecommendations('test-user');

        expect(recommendations.length).toBe(0);
    });
});
