/**
 * Lightspeed POS Service
 * Handles connection and data sync with Lightspeed Restaurant/Retail
 */

interface LightspeedCredentials {
    account_id: string;
    access_token: string;
    api_type: 'retail' | 'restaurant';
}

interface LightspeedItem {
    itemID: string;
    description: string;
    customSku: string;
    defaultCost: string;
    avgCost: string;
    Prices?: {
        ItemPrice: {
            amount: string;
        }[];
    };
}

export const lightspeedService = {
    /**
     * Get base URL based on API type
     */
    getBaseUrl(apiType: 'retail' | 'restaurant'): string {
        return apiType === 'retail'
            ? 'https://api.lightspeedapp.com/API/V3'
            : 'https://api.lightspeedapp.com/R';
    },

    /**
     * Test connection to Lightspeed account
     */
    async testConnection(credentials: LightspeedCredentials): Promise<{
        success: boolean;
        accountName?: string;
        error?: string;
    }> {
        try {
            const baseUrl = this.getBaseUrl(credentials.api_type);
            const response = await fetch(
                `${baseUrl}/Account/${credentials.account_id}.json`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${credentials.access_token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                return {
                    success: false,
                    error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
                };
            }

            const data = await response.json();

            return {
                success: true,
                accountName: data.Account?.name || 'Unknown Account',
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Network error occurred',
            };
        }
    },

    /**
     * Fetch items/products from Lightspeed
     */
    async getItems(credentials: LightspeedCredentials): Promise<{
        success: boolean;
        items?: LightspeedItem[];
        error?: string;
    }> {
        try {
            const baseUrl = this.getBaseUrl(credentials.api_type);
            const response = await fetch(
                `${baseUrl}/Account/${credentials.account_id}/Item.json?limit=100`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${credentials.access_token}`,
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
                items: data.Item || [],
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch items',
            };
        }
    },

    /**
     * Get inventory counts
     */
    async getInventory(credentials: LightspeedCredentials): Promise<{
        success: boolean;
        inventory?: any[];
        error?: string;
    }> {
        try {
            const baseUrl = this.getBaseUrl(credentials.api_type);
            const response = await fetch(
                `${baseUrl}/Account/${credentials.account_id}/ItemMatrix.json`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${credentials.access_token}`,
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
                inventory: data.ItemMatrix || [],
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch inventory',
            };
        }
    },

    /**
     * Generate OAuth URL for Lightspeed
     */
    getOAuthUrl(clientId: string, redirectUri: string, scope: string): string {
        return `https://cloud.lightspeedapp.com/oauth/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    }
};

export default lightspeedService;
