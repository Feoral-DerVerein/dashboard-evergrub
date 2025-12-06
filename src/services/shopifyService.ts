/**
 * Shopify POS Service
 * Handles connection and data sync with Shopify
 */

interface ShopifyCredentials {
    shop_domain: string;
    access_token: string;
}

interface ShopifyProduct {
    id: string;
    title: string;
    variants: {
        id: string;
        title: string;
        price: string;
        inventory_quantity: number;
        sku: string;
    }[];
}

export const shopifyService = {
    /**
     * Test connection to Shopify store
     */
    async testConnection(credentials: ShopifyCredentials): Promise<{
        success: boolean;
        shopName?: string;
        error?: string;
    }> {
        try {
            const response = await fetch(
                `https://${credentials.shop_domain}/admin/api/2024-01/shop.json`,
                {
                    method: 'GET',
                    headers: {
                        'X-Shopify-Access-Token': credentials.access_token,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                return {
                    success: false,
                    error: errorData.errors || `HTTP ${response.status}: ${response.statusText}`,
                };
            }

            const data = await response.json();

            return {
                success: true,
                shopName: data.shop?.name || 'Unknown Shop',
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Network error occurred',
            };
        }
    },

    /**
     * Fetch products from Shopify store
     */
    async getProducts(credentials: ShopifyCredentials): Promise<{
        success: boolean;
        products?: ShopifyProduct[];
        error?: string;
    }> {
        try {
            const response = await fetch(
                `https://${credentials.shop_domain}/admin/api/2024-01/products.json?limit=250`,
                {
                    method: 'GET',
                    headers: {
                        'X-Shopify-Access-Token': credentials.access_token,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                return {
                    success: false,
                    error: `HTTP ${response.status}`,
                };
            }

            const data = await response.json();

            return {
                success: true,
                products: data.products || [],
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch products',
            };
        }
    },

    /**
     * Get inventory levels for products
     */
    async getInventoryLevels(credentials: ShopifyCredentials, locationId: string): Promise<{
        success: boolean;
        inventory?: any[];
        error?: string;
    }> {
        try {
            const response = await fetch(
                `https://${credentials.shop_domain}/admin/api/2024-01/inventory_levels.json?location_ids=${locationId}`,
                {
                    method: 'GET',
                    headers: {
                        'X-Shopify-Access-Token': credentials.access_token,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                return {
                    success: false,
                    error: `HTTP ${response.status}`,
                };
            }

            const data = await response.json();

            return {
                success: true,
                inventory: data.inventory_levels || [],
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch inventory',
            };
        }
    },

    /**
     * Generate OAuth URL for Shopify
     */
    getOAuthUrl(shopDomain: string, clientId: string, redirectUri: string, scopes: string[]): string {
        const scopeString = scopes.join(',');
        return `https://${shopDomain}/admin/oauth/authorize?client_id=${clientId}&scope=${scopeString}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    }
};

export default shopifyService;
