/**
 * Unified POS Service
 * Central hub for all POS integrations
 */

import { shopifyService } from './shopifyService';
import { lightspeedService } from './lightspeedService';
import { toastService } from './toastService';
import { testSquareConnection } from './squareService';

export type POSProvider = 'square' | 'shopify' | 'lightspeed' | 'toast';

export interface POSConnectionResult {
    success: boolean;
    providerName?: string;
    error?: string;
}

export interface POSConfig {
    provider: POSProvider;
    credentials: Record<string, string>;
}

/**
 * Available POS providers with their metadata
 */
export const posProviders = [
    {
        id: 'square' as POSProvider,
        name: 'Square',
        description: 'Point of sale for retail and restaurants',
        logo: '/integration-logos/square-logo.png',
        requiredFields: ['application_id', 'access_token', 'location_id'],
    },
    {
        id: 'shopify' as POSProvider,
        name: 'Shopify',
        description: 'E-commerce and retail POS',
        logo: '/integration-logos/shopify-logo.png',
        requiredFields: ['shop_domain', 'access_token'],
    },
    {
        id: 'lightspeed' as POSProvider,
        name: 'Lightspeed',
        description: 'Restaurant and retail POS',
        logo: '/integration-logos/lightspeed-logo.png',
        requiredFields: ['account_id', 'access_token', 'api_type'],
    },
    {
        id: 'toast' as POSProvider,
        name: 'Toast',
        description: 'Restaurant-specific POS system',
        logo: '/integration-logos/toast-logo.png',
        requiredFields: ['restaurant_guid', 'access_token'],
    },
];

/**
 * Test connection to any POS provider
 */
export async function testPOSConnection(config: POSConfig): Promise<POSConnectionResult> {
    const { provider, credentials } = config;

    switch (provider) {
        case 'square':
            const squareResult = await testSquareConnection({
                application_id: credentials.application_id,
                access_token: credentials.access_token,
                location_id: credentials.location_id,
            });
            return {
                success: squareResult.success,
                providerName: squareResult.locationName,
                error: squareResult.error,
            };

        case 'shopify':
            const shopifyResult = await shopifyService.testConnection({
                shop_domain: credentials.shop_domain,
                access_token: credentials.access_token,
            });
            return {
                success: shopifyResult.success,
                providerName: shopifyResult.shopName,
                error: shopifyResult.error,
            };

        case 'lightspeed':
            const lightspeedResult = await lightspeedService.testConnection({
                account_id: credentials.account_id,
                access_token: credentials.access_token,
                api_type: credentials.api_type as 'retail' | 'restaurant',
            });
            return {
                success: lightspeedResult.success,
                providerName: lightspeedResult.accountName,
                error: lightspeedResult.error,
            };

        case 'toast':
            const toastResult = await toastService.testConnection({
                restaurant_guid: credentials.restaurant_guid,
                access_token: credentials.access_token,
            });
            return {
                success: toastResult.success,
                providerName: toastResult.restaurantName,
                error: toastResult.error,
            };

        default:
            return {
                success: false,
                error: `Unknown POS provider: ${provider}`,
            };
    }
}

export { shopifyService, lightspeedService, toastService };
