import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuditService, AuditLogEntry } from '../services/auditService';
import { collection, addDoc } from 'firebase/firestore';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
    addDoc: vi.fn(),
    serverTimestamp: vi.fn(() => 'mock-timestamp'),
    getFirestore: vi.fn(),
}));

vi.mock('@/lib/firebase', () => ({
    db: {},
}));

describe('AuditService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should call addDoc with correct parameters in log()', async () => {
        const entry: AuditLogEntry = {
            userId: 'user-1',
            userEmail: 'test@example.com',
            action: 'CREATE',
            entity: 'PRODUCT',
            entityId: 'prod-1',
            newValue: { name: 'New Product' }
        };

        await AuditService.log(entry);

        expect(addDoc).toHaveBeenCalled();
        const callArgs = vi.mocked(addDoc).mock.calls[0];
        expect(callArgs[1]).toMatchObject({
            ...entry,
            timestamp: 'mock-timestamp'
        });
    });

    it('should correctly format product change logs', async () => {
        await AuditService.logProductChange(
            'u1', 'e1@test.com', 'p1',
            { price: 10 }, { price: 12 },
            'UPDATE'
        );

        expect(addDoc).toHaveBeenCalled();
        const data = vi.mocked(addDoc).mock.calls[0][1] as any;
        expect(data.action).toBe('UPDATE');
        expect(data.oldValue.price).toBe(10);
        expect(data.newValue.price).toBe(12);
    });

    it('should correctly format stock change logs', async () => {
        await AuditService.logStockChange('u1', 'e1@test.com', 'p1', 10, 5, 'Sale');

        expect(addDoc).toHaveBeenCalled();
        const data = vi.mocked(addDoc).mock.calls[0][1] as any;
        expect(data.metadata.reason).toBe('Sale');
        expect(data.oldValue.quantity).toBe(10);
        expect(data.newValue.quantity).toBe(5);
    });
});
