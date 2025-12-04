import { supabase } from '@/integrations/supabase/client';

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
            // Transform to expected format for Edge Function
            const payload = {
                transactions: transaction.items.map(item => ({
                    product_id: item.productId,
                    quantity: item.quantity,
                    amount: item.totalPrice,
                    pos_reference: transaction.transactionId,
                    timestamp: transaction.timestamp.toISOString()
                }))
            };

            const { error } = await supabase.functions.invoke('pos-sync', {
                body: payload,
                method: 'POST'
            });

            if (error) throw error;

            console.log('Transaction ingested successfully via Edge Function:', transaction.transactionId);
        } catch (error) {
            console.error('Error ingesting POS transaction:', error);
            throw error;
        }
    }

    /**
     * Update product inventory
     */
    private static async updateInventory(
        productId: number,
        quantityChange: number,
        tenantId: string
    ): Promise<void> {
        const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('quantity')
            .eq('id', productId)
            .eq('tenant_id', tenantId)
            .single();

        if (fetchError) throw fetchError;

        const newQuantity = (product?.quantity || 0) + quantityChange;

        const { error: updateError } = await supabase
            .from('products')
            .update({ quantity: newQuantity })
            .eq('id', productId)
            .eq('tenant_id', tenantId);

        if (updateError) throw updateError;
    }

    /**
     * Sync products from POS system
     */
    static async syncProducts(products: any[], tenantId: string): Promise<void> {
        try {
            const { error } = await supabase.functions.invoke('import-products', {
                body: { products, tenant_id: tenantId },
            });

            if (error) throw error;
            console.log('Products synced successfully');
        } catch (error) {
            console.error('Error syncing products:', error);
            throw error;
        }
    }
}
