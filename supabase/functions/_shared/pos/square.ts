
import { POSProvider, AuthTokens, UnifiedProduct, UnifiedTransaction, UnifiedTransactionItem } from './types.ts';

export interface SquareConfig {
    applicationId: string;
    applicationSecret: string;
    environment: 'production' | 'sandbox';
}

export class SquareProvider implements POSProvider {
    private config: SquareConfig;
    private baseUrl: string;

    constructor(config: SquareConfig) {
        this.config = config;
        this.baseUrl = config.environment === 'production'
            ? 'https://connect.squareup.com'
            : 'https://connect.squareupsandbox.com';
    }

    getAuthUrl(state: string): string {
        return `${this.baseUrl}/oauth2/authorize?client_id=${this.config.applicationId}&scope=ITEMS_READ,ORDERS_READ,MERCHANT_PROFILE_READ&state=${state}`;
    }

    async exchangeCode(code: string): Promise<AuthTokens> {
        const response = await fetch(`${this.baseUrl}/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Square-Version': '2024-12-18',
            },
            body: JSON.stringify({
                client_id: this.config.applicationId,
                client_secret: this.config.applicationSecret,
                code,
                grant_type: 'authorization_code',
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Square Token Exchange Failed: ${errorText}`);
        }

        const data = await response.json();
        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresAt: new Date(data.expires_at), // Square sends ISO string
            merchantId: data.merchant_id,
        };
    }

    // Specific to Square, kept for connection setup
    async getLocations(accessToken: string): Promise<{ id: string, name: string, currency: string }[]> {
        const response = await fetch(`${this.baseUrl}/v2/locations`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Square-Version': '2024-12-18',
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch Square locations');
        }

        const data = await response.json();
        return (data.locations || []).map((loc: any) => ({
            id: loc.id,
            name: loc.name,
            currency: loc.currency,
        }));
    }

    async getProducts(accessToken: string): Promise<UnifiedProduct[]> {
        const response = await fetch(`${this.baseUrl}/v2/catalog/list?types=ITEM`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Square-Version': '2024-12-18',
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.warn('Failed to fetch Square catalog');
            return [];
        }

        const data = await response.json();
        const items = data.objects || [];

        return items.map((item: any) => {
            const variation = item.item_data?.variations?.[0];
            const priceMoney = variation?.item_variation_data?.price_money;
            const price = priceMoney ? Number(priceMoney.amount) / 100 : 0;

            return {
                id: item.id,
                name: item.item_data?.name || 'Unnamed Product',
                category: item.item_data?.category_id || 'General', // We get ID here, normally need separate fetch for names but ID is fine for now
                price,
                sku: variation?.item_variation_data?.sku,
                stockLevel: 0 // Fetching stock requires separate Inventory API call in Square
            };
        });
    }

    async getTransactions(accessToken: string, fromDate: Date, toDate?: Date): Promise<UnifiedTransaction[]> {
        const response = await fetch(`${this.baseUrl}/v2/orders/search`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Square-Version': '2024-12-18',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: {
                    filter: {
                        state_filter: { states: ['COMPLETED'] },
                        date_time_filter: {
                            created_at: {
                                start_at: fromDate.toISOString(),
                                end_at: toDate ? toDate.toISOString() : undefined
                            }
                        }
                    }
                }
            })
        });

        if (!response.ok) {
            console.warn('Failed to fetch Square transactions');
            return [];
        }

        const data = await response.json();
        const orders = data.orders || [];

        return orders.map((order: any) => ({
            id: order.id,
            date: new Date(order.created_at),
            totalAmount: Number(order.total_money?.amount || 0) / 100,
            currency: order.total_money?.currency || 'USD',
            items: (order.line_items || []).map((item: any) => ({
                productId: item.catalog_object_id,
                productName: item.name,
                quantity: Number(item.quantity),
                unitPrice: Number(item.base_price_money?.amount || 0) / 100,
                totalPrice: Number(item.total_money?.amount || 0) / 100
            }))
        }));
    }

    async refreshToken(refreshToken: string): Promise<AuthTokens> {
        const response = await fetch(`${this.baseUrl}/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Square-Version': '2024-12-18',
            },
            body: JSON.stringify({
                client_id: this.config.applicationId,
                client_secret: this.config.applicationSecret,
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Square Token Refresh Failed: ${errorText}`);
        }

        const data = await response.json();
        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresAt: new Date(data.expires_at),
            merchantId: data.merchant_id,
        };
    }
}
