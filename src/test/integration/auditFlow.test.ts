import { describe, it, expect, vi, beforeEach } from 'vitest';
import { productService } from '../../services/productService';
import { AuditService } from '../../services/auditService';
import { auth, db } from '../../lib/firebase';
import { addDoc, updateDoc, deleteDoc, doc, getDoc, collection } from 'firebase/firestore';

// Mock Firebase and AuditService
vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
    doc: vi.fn(),
    addDoc: vi.fn(() => Promise.resolve({ id: 'new-id' })),
    updateDoc: vi.fn(() => Promise.resolve()),
    deleteDoc: vi.fn(() => Promise.resolve()),
    getDoc: vi.fn(() => Promise.resolve({
        exists: () => true,
        data: () => ({ name: 'Old Product', quantity: 10 })
    })),
    query: vi.fn(),
    where: vi.fn(),
    getDocs: vi.fn(),
}));

vi.mock('../../lib/firebase', () => ({
    db: {},
    auth: {
        currentUser: {
            uid: 'user-123',
            email: 'admin@test.com'
        }
    }
}));

vi.mock('../../services/auditService', () => ({
    AuditService: {
        logProductChange: vi.fn(),
        logStockChange: vi.fn(),
        log: vi.fn()
    }
}));

describe('Audit Flow Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should trigger AuditService.logProductChange when creating a product', async () => {
        const productData: any = { name: 'New Product', price: 100 };
        await productService.createProduct(productData);

        expect(AuditService.logProductChange).toHaveBeenCalledWith(
            'user-123',
            'admin@test.com',
            'new-id',
            null,
            expect.objectContaining({ name: 'New Product' }),
            'CREATE'
        );
    });

    it('should trigger AuditService.logProductChange and logStockChange when updating stock', async () => {
        const updates = { quantity: 15 };
        await productService.updateProduct('prod-123', updates);

        expect(AuditService.logProductChange).toHaveBeenCalled();
        expect(AuditService.logStockChange).toHaveBeenCalledWith(
            'user-123',
            'admin@test.com',
            'prod-123',
            10, // old quantity from mock
            15 // new quantity
        );
    });

    it('should trigger AuditService.logProductChange when deleting a product', async () => {
        await productService.deleteProduct('prod-123');

        expect(AuditService.logProductChange).toHaveBeenCalledWith(
            'user-123',
            'admin@test.com',
            'prod-123',
            expect.objectContaining({ name: 'Old Product' }),
            null,
            'DELETE'
        );
    });
});
