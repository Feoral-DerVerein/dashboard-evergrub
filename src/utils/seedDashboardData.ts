/**
 * Seed Dashboard Data Utility
 * 
 * Functions to generate and inject realistic test data for dashboard testing
 */

import { POSIntegrationService } from '@/services/api/pos-integration';
import type { POSTransaction, POSItem } from '@/types/dashboard';
import { db } from "@/lib/firebase";
import {
    collection,
    writeBatch,
    doc,
    query,
    where,
    getDocs
} from "firebase/firestore";

/**
 * Product categories for realistic data generation
 */
const PRODUCT_CATEGORIES = {
    produce: ['Apples', 'Bananas', 'Carrots', 'Lettuce', 'Tomatoes', 'Potatoes', 'Onions'],
    dairy: ['Milk', 'Cheese', 'Yogurt', 'Butter', 'Cream'],
    meat: ['Chicken', 'Beef', 'Pork', 'Fish', 'Lamb'],
    bakery: ['Bread', 'Croissants', 'Muffins', 'Bagels', 'Cookies'],
    beverages: ['Coffee', 'Tea', 'Juice', 'Soda', 'Water'],
};

const PAYMENT_METHODS = ['credit_card', 'debit_card', 'cash', 'mobile_payment'];

/**
 * Generate random number between min and max
 */
const randomBetween = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Generate random date within last N days
 */
const randomDate = (daysAgo: number): Date => {
    const now = new Date();
    const pastDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const randomTime = pastDate.getTime() + Math.random() * (now.getTime() - pastDate.getTime());
    return new Date(randomTime);
};

/**
 * Generate random products for a transaction
 */
const generateRandomProducts = (): POSItem[] => {
    const numItems = randomBetween(1, 5);
    const items: POSItem[] = [];

    const categories = Object.values(PRODUCT_CATEGORIES).flat();

    for (let i = 0; i < numItems; i++) {
        const productName = categories[randomBetween(0, categories.length - 1)];
        const quantity = randomBetween(1, 3);
        const unitPrice = randomBetween(2, 20);
        const totalPrice = quantity * unitPrice;

        items.push({
            productId: randomBetween(1, 100),
            productName,
            quantity,
            unitPrice,
            totalPrice,
        });
    }

    return items;
};

/**
 * Generate a single mock transaction
 */
export const generateMockTransaction = (daysAgo: number = 0): POSTransaction => {
    const items = generateRandomProducts();
    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

    return {
        transactionId: `TXN-${Date.now()}-${randomBetween(1000, 9999)}`,
        timestamp: randomDate(daysAgo),
        items,
        totalAmount,
        paymentMethod: PAYMENT_METHODS[randomBetween(0, PAYMENT_METHODS.length - 1)],
        customerId: Math.random() > 0.7 ? `CUST-${randomBetween(1, 100)}` : undefined,
        tenantId: '', // Will be set when injecting
    };
};

/**
 * Generate multiple mock transactions
 */
export const generateMockTransactions = (count: number, daysBack: number = 30): POSTransaction[] => {
    const transactions: POSTransaction[] = [];

    for (let i = 0; i < count; i++) {
        const daysAgo = randomBetween(0, daysBack);
        transactions.push(generateMockTransaction(daysAgo));
    }

    return transactions;
};

/**
 * Generate mock products for inventory
 */
export const generateMockProducts = (count: number = 50) => {
    const products = [];
    const allProducts = Object.values(PRODUCT_CATEGORIES).flat();

    for (let i = 0; i < Math.min(count, allProducts.length); i++) {
        const name = allProducts[i];
        const quantity = randomBetween(0, 100);
        const price = randomBetween(2, 50);

        // Some products will expire soon
        const willExpire = Math.random() > 0.8;
        const expiryDate = willExpire
            ? new Date(Date.now() + randomBetween(1, 7) * 24 * 60 * 60 * 1000)
            : new Date(Date.now() + randomBetween(30, 90) * 24 * 60 * 60 * 1000);

        products.push({
            name,
            quantity,
            price,
            sku: `SKU-${i.toString().padStart(4, '0')}`,
            category: Object.keys(PRODUCT_CATEGORIES).find(key =>
                PRODUCT_CATEGORIES[key as keyof typeof PRODUCT_CATEGORIES].includes(name)
            ) || 'other',
            expiry_date: expiryDate.toISOString(),
        });
    }

    return products;
};

/**
 * Inject test sales data
 */
export const injectTestSales = async (
    userId: string,
    count: number = 20,
    daysBack: number = 30
): Promise<{ success: boolean; message: string; count: number }> => {
    try {
        console.log(`Injecting ${count} test sales for user ${userId}...`);

        const transactions = generateMockTransactions(count, daysBack);
        let successCount = 0;

        for (const transaction of transactions) {
            try {
                await POSIntegrationService.ingestTransaction(
                    { ...transaction, tenantId: userId },
                    userId
                );
                successCount++;
            } catch (error) {
                console.error('Error injecting transaction:', error);
            }
        }

        return {
            success: true,
            message: `Successfully injected ${successCount} out of ${count} transactions`,
            count: successCount,
        };
    } catch (error) {
        console.error('Error in injectTestSales:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to inject test data',
            count: 0,
        };
    }
};

/**
 * Inject test products data
 */
export const injectTestProducts = async (
    userId: string,
    count: number = 50
): Promise<{ success: boolean; message: string; count: number }> => {
    try {
        console.log(`Injecting ${count} test products for user ${userId}...`);

        const products = generateMockProducts(count);

        // Add tenant_id to each product
        const productsWithTenant = products.map(p => ({
            ...p,
            tenant_id: userId,
        }));

        const batch = writeBatch(db);
        const productsCollection = collection(db, 'products');

        productsWithTenant.forEach(product => {
            const newDocRef = doc(productsCollection);
            batch.set(newDocRef, { ...product, created_at: new Date().toISOString() });
        });

        await batch.commit();

        return {
            success: true,
            message: `Successfully injected ${productsWithTenant.length} products`,
            count: productsWithTenant.length,
        };
    } catch (error) {
        console.error('Error in injectTestProducts:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to inject products',
            count: 0,
        };
    }
};

/**
 * Inject complete test dataset
 */
export const injectCompleteTestData = async (
    userId: string,
    options: {
        salesCount?: number;
        productsCount?: number;
        daysBack?: number;
    } = {}
): Promise<{
    success: boolean;
    sales: { success: boolean; count: number };
    products: { success: boolean; count: number };
    message: string;
}> => {
    const {
        salesCount = 50,
        productsCount = 30,
        daysBack = 30,
    } = options;

    try {
        console.log('Starting complete test data injection...');

        // Inject products first
        const productsResult = await injectTestProducts(userId, productsCount);

        // Then inject sales
        const salesResult = await injectTestSales(userId, salesCount, daysBack);

        const overallSuccess = productsResult.success && salesResult.success;

        return {
            success: overallSuccess,
            sales: {
                success: salesResult.success,
                count: salesResult.count,
            },
            products: {
                success: productsResult.success,
                count: productsResult.count,
            },
            message: overallSuccess
                ? `Successfully injected ${salesResult.count} sales and ${productsResult.count} products`
                : 'Some data injection failed. Check console for details.',
        };
    } catch (error) {
        console.error('Error in injectCompleteTestData:', error);
        return {
            success: false,
            sales: { success: false, count: 0 },
            products: { success: false, count: 0 },
            message: error instanceof Error ? error.message : 'Failed to inject test data',
        };
    }
};

/**
 * Clear all test data for a user
 */
export const clearTestData = async (userId: string): Promise<{ success: boolean; message: string }> => {
    try {
        console.log(`Clearing test data for user ${userId}...`);

        // Batch delete sales
        const salesQ = query(collection(db, 'sales'), where('tenant_id', '==', userId));
        const salesSnapshot = await getDocs(salesQ);

        const salesBatch = writeBatch(db);
        salesSnapshot.docs.forEach(doc => {
            salesBatch.delete(doc.ref);
        });
        await salesBatch.commit();

        // Batch delete products
        const productsQ = query(collection(db, 'products'), where('tenant_id', '==', userId));
        const productsSnapshot = await getDocs(productsQ);

        const productsBatch = writeBatch(db);
        productsSnapshot.docs.forEach(doc => {
            productsBatch.delete(doc.ref);
        });
        await productsBatch.commit();

        return {
            success: true,
            message: 'Successfully cleared all test data',
        };
    } catch (error) {
        console.error('Error clearing test data:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to clear test data',
        };
    }
};

