/**
 * Toast POS Service
 * Handles connection and data sync with Toast Restaurant POS
 */

interface ToastCredentials {
    restaurant_guid: string;
    access_token: string;
    location_guid?: string;
}

interface ToastMenuItem {
    guid: string;
    name: string;
    plu: string;
    price: number;
    calories?: number;
}

export const toastService = {
    /**
     * Base URL for Toast API
     */
    baseUrl: 'https://ws-api.toasttab.com',

    /**
     * Test connection to Toast restaurant
     */
    async testConnection(credentials: ToastCredentials): Promise<{
        success: boolean;
        restaurantName?: string;
        error?: string;
    }> {
        try {
            const response = await fetch(
                `${this.baseUrl}/restaurants/v1/restaurants/${credentials.restaurant_guid}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${credentials.access_token}`,
                        'Toast-Restaurant-External-ID': credentials.restaurant_guid,
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
                restaurantName: data.name || 'Unknown Restaurant',
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Network error occurred',
            };
        }
    },

    /**
     * Fetch menu items from Toast
     */
    async getMenuItems(credentials: ToastCredentials): Promise<{
        success: boolean;
        items?: ToastMenuItem[];
        error?: string;
    }> {
        try {
            const response = await fetch(
                `${this.baseUrl}/menus/v2/menus/${credentials.restaurant_guid}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${credentials.access_token}`,
                        'Toast-Restaurant-External-ID': credentials.restaurant_guid,
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

            // Flatten menu groups into items
            const items: ToastMenuItem[] = [];
            if (data.menus) {
                data.menus.forEach((menu: any) => {
                    menu.groups?.forEach((group: any) => {
                        group.items?.forEach((item: any) => {
                            items.push({
                                guid: item.guid,
                                name: item.name,
                                plu: item.plu || '',
                                price: item.price || 0,
                                calories: item.calories,
                            });
                        });
                    });
                });
            }

            return {
                success: true,
                items,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch menu items',
            };
        }
    },

    /**
     * Get orders from Toast
     */
    async getOrders(credentials: ToastCredentials, startDate: string, endDate: string): Promise<{
        success: boolean;
        orders?: any[];
        error?: string;
    }> {
        try {
            const response = await fetch(
                `${this.baseUrl}/orders/v2/ordersBulk?startDate=${startDate}&endDate=${endDate}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${credentials.access_token}`,
                        'Toast-Restaurant-External-ID': credentials.restaurant_guid,
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
                orders: data || [],
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch orders',
            };
        }
    },

    /**
     * Get inventory from Toast
     */
    async getInventory(credentials: ToastCredentials): Promise<{
        success: boolean;
        inventory?: any[];
        error?: string;
    }> {
        try {
            const response = await fetch(
                `${this.baseUrl}/stock/v1/inventory/${credentials.restaurant_guid}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${credentials.access_token}`,
                        'Toast-Restaurant-External-ID': credentials.restaurant_guid,
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
                inventory: data || [],
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch inventory',
            };
        }
    }
};

export default toastService;
