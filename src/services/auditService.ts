import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface AuditLogEntry {
    userId: string;
    userEmail: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'SYNC';
    entity: 'PRODUCT' | 'SALE' | 'INTEGRATION' | 'PROFILE' | 'STORE_PROFILE';
    entityId: string;
    oldValue?: any;
    newValue?: any;
    metadata?: Record<string, any>;
}

export class AuditService {
    private static COLLECTION_NAME = 'audit_logs';

    /**
     * Log a system action
     */
    static async log(entry: AuditLogEntry): Promise<void> {
        try {
            console.log(`📝 Auditing: ${entry.action} on ${entry.entity} (${entry.entityId})`);

            await addDoc(collection(db, this.COLLECTION_NAME), {
                ...entry,
                timestamp: serverTimestamp(),
            });
        } catch (error) {
            console.error('❌ Failed to create audit log:', error);
            // We don't throw here to avoid blocking the main operation, 
            // but in a production system we might want more robust error handling
        }
    }

    /**
     * Specialized logger for product changes (anti-fraud requirement)
     */
    static async logProductChange(userId: string, email: string, productId: string, oldData: any, newData: any, action: 'CREATE' | 'UPDATE' | 'DELETE'): Promise<void> {
        return this.log({
            userId,
            userEmail: email,
            action,
            entity: 'PRODUCT',
            entityId: productId,
            oldValue: oldData,
            newValue: newData,
        });
    }

    /**
     * Specialized logger for stock changes
     */
    static async logStockChange(userId: string, email: string, productId: string, oldStock: number, newStock: number, reason: string = 'Update'): Promise<void> {
        return this.log({
            userId,
            userEmail: email,
            action: 'UPDATE',
            entity: 'PRODUCT',
            entityId: productId,
            oldValue: { quantity: oldStock },
            newValue: { quantity: newStock },
            metadata: { type: 'STOCK_CHANGE', reason }
        });
    }
}
