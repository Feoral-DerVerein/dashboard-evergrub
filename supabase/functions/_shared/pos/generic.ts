
import { POSProvider, AuthResult, POSLocation, POSProduct, POSConnectionConfig } from './types.ts';

/**
 * Generic Provider Skeleton
 * Use this as a template for Shopify, Clover, or Lightspeed.
 */
export class GenericPOSProvider implements POSProvider {
    private config: POSConnectionConfig;

    constructor(config: POSConnectionConfig) {
        this.config = config;
    }

    async exchangeCode(code: string): Promise<AuthResult> {
        console.log("Mocking token exchange for Generic POS...");
        return {
            accessToken: "mock_access_token",
            merchantId: "mock_merchant_id"
        };
    }

    async getLocations(accessToken: string): Promise<POSLocation[]> {
        return [
            { id: "loc_1", name: "Main Store", currency: "USD" }
        ];
    }

    async getCatalog(accessToken: string): Promise<POSProduct[]> {
        return [
            { externalId: "prod_1", name: "Generic Coffee", price: 3.50, category: "Beverages" }
        ];
    }
}
