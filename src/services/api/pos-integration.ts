import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

/**
 * Standardized POS data format
 */
export interface POSTransaction {
    transactionId: string;
    timestamp: Date;
    items: POSItem[];
    totalAmount: number;
    paymentMethod: string;
    customerId?: string;
    items_count?: number;
}

export interface POSItem {
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

/**
 * POS Integration Service
 * Handles data ingestion from various POS systems
 */
export class POSIntegrationService {
    /**
     * Ingest transaction data from POS system
     */
    static async ingestTransaction(transaction: POSTransaction, tenantId: string): Promise<void> {
        try {
            console.log('Ingesting transaction (Firebase pending implementation):', transaction);
            // TODO: Call Firebase Cloud Function 'posSync'
            // const posSync = httpsCallable(functions, 'posSync');
            // await posSync({ transactions: ... });

            console.log('Transaction ingested successfully (Mocked for Migration):', transaction.transactionId);
        } catch (error) {
            console.error('Error ingesting POS transaction:', error);
            throw error;
        }
    }

    /**
     * Update product inventory
     */
    private static async updateInventory(
        productId: number | string,
        quantityChange: number,
        tenantId: string
    ): Promise<void> {
        // Assuming Firestore uses string IDs. If productId is number, we need to know the mapping.
        // For now, assuming direct ID match.
        const productRef = doc(db, 'products', String(productId));
        const productSnap = await getDoc(productRef);

        if (!productSnap.exists()) {
            console.error(`Product ${productId} not found`);
            return; // Or throw
        }

        const productData = productSnap.data();
        // Check tenantId if needed
        // if (productData.tenant_id !== tenantId) ...

        const newQuantity = (productData?.quantity || 0) + quantityChange;

        await updateDoc(productRef, { quantity: newQuantity });
    }

    /**
     * Sync products from Square API
     */
    static async syncProductsFromSquare(credentials: { access_token: string }): Promise<any[]> {
        const response = await fetch('https://connect.squareup.com/v2/catalog/list?types=ITEM', {
            headers: {
                'Square-Version': '2024-12-18',
                'Authorization': `Bearer ${credentials.access_token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Square API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.objects || [];
    }

    /**
     * Fetch transactions from Square API
     */
    static async fetchSquareTransactions(credentials: { access_token: string; location_id: string }, beginTime?: string): Promise<any[]> {
        const url = new URL(`https://connect.squareup.com/v2/locations/${credentials.location_id}/orders/search`);

        const response = await fetch(url.toString(), {
            method: 'POST',
            headers: {
                'Square-Version': '2024-12-18',
                'Authorization': `Bearer ${credentials.access_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                location_ids: [credentials.location_id],
                query: {
                    filter: {
                        state_filter: { states: ["COMPLETED"] },
                        date_time_filter: {
                            created_at: {
                                start_at: beginTime || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
                            }
                        }
                    },
                    sort: { sort_field: "CREATED_AT", sort_order: "DESC" }
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Square API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.orders || [];
    }

    /**
     * Sync products from POS system (Generic wrapper)
     */
    static async syncProducts(products: any[], tenantId: string): Promise<void> {
        try {
            console.log("Syncing products to Firestore for tenant:", tenantId);
            // In a real implementation, we would batch write these to the 'products' collection
            // for the specific tenant.
            console.log('Products synced successfully (Mocked Firestore Write)');
        } catch (error) {
            console.error('Error syncing products:', error);
            throw error;
        }
    }
}
