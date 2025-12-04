import { supabase } from "@/integrations/supabase/client";

const EDGE_FUNCTION_URL = "https://YOUR_PROJECT_REF.supabase.co/functions/v1"; // Replace with actual URL or use relative path if configured

export const enterpriseService = {
    /**
     * Helper to call Edge Functions with Auth
     */
    async callFunction(functionName: string, method: string = 'GET', body?: any) {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            throw new Error("Not authenticated");
        }

        const headers = {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
        };

        const options: RequestInit = {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        };

        // In local development, Supabase functions are usually at http://localhost:54321/functions/v1/...
        // In production, they are at the project URL.
        // For now, we'll use the supabase.functions.invoke method which handles the URL automatically.

        const { data, error } = await supabase.functions.invoke(functionName, {
            body: body,
            method: method as "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
            headers: {
                // Authorization is handled automatically by supabase-js if we use invoke
            }
        });

        if (error) throw error;
        return data;
    },

    // Inventory Management
    async getProducts() {
        return this.callFunction('inventory-management/products', 'GET');
    },

    async getExpiringProducts() {
        return this.callFunction('inventory-management/products-expiring', 'GET');
    },

    async getInventory() {
        return this.callFunction('inventory-management/inventory', 'GET');
    },

    async updateInventory(productId: string, updates: { current_stock?: number, min_stock?: number, max_stock?: number }) {
        return this.callFunction('inventory-management/inventory-update', 'POST', {
            product_id: productId,
            ...updates
        });
    },

    // Forecasting
    async getDemandForecast(productId: string, days: number = 7) {
        return this.callFunction('forecasting-engine/forecast-demand', 'POST', {
            product_id: productId,
            days
        });
    },

    async getExpirationRisk() {
        return this.callFunction('forecasting-engine/forecast-expiration-risk', 'POST', {});
    },

    async getCurrentWeather() {
        return this.callFunction('forecasting-engine/weather-current', 'GET');
    },

    // Automation & Alerts
    async getAlerts() {
        return this.callFunction('automation-engine/alerts', 'GET');
    },

    async createAlert(type: string, message: string) {
        return this.callFunction('automation-engine/alerts-create', 'POST', {
            type,
            message
        });
    }
};
