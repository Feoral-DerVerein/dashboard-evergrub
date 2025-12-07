import { supabase } from "@/integrations/supabase/client";

export interface PrescriptiveAction {
    id: string;
    type: 'restock' | 'promo' | 'donate';
    title: string;
    description: string;
    impact: string;
    priority: 'high' | 'medium' | 'low';
    productId?: string;
    suggestedPrice?: number;
    currentPrice?: number;
}

export const smartInventoryService = {
    /**
     * Get items that are expiring within the text X days
     */
    async getExpiringProducts(userId: string, daysThreshold: number = 7) {
        try {
            const today = new Date();
            const thresholdDate = new Date();
            thresholdDate.setDate(today.getDate() + daysThreshold);

            const { data, error } = await supabase
                .from('products')
                .select('*')
                // .eq('userid', userId) // Uncomment when RLS is fully strict or user_id is consistent
                .gt('expirationdate', today.toISOString())
                .lt('expirationdate', thresholdDate.toISOString())
                .order('expirationdate', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error("Error fetching expiring products:", error);
            return [];
        }
    },

    /**
     * Execute an action (e.g. apply discount)
     */
    async executeAction(action: PrescriptiveAction) {
        if (!action.productId) return false;

        try {
            if (action.type === 'promo' && action.suggestedPrice) {
                // Update price in DB
                const { error } = await supabase
                    .from('products')
                    .update({
                        price: action.suggestedPrice,
                        // Optionally add a flag for 'is_discounted' if schema supports it
                    })
                    .eq('id', parseInt(action.productId));

                if (error) throw error;
                return true;
            }

            // Other actions (restock, donate) could trigger other flows or just log it
            return true;
        } catch (error) {
            console.error("Error executing action:", error);
            return false;
        }
    },

    /**
     * Generate list of intelligent actions based on real inventory data
     */
    async generatePrescriptiveActions(userId: string): Promise<PrescriptiveAction[]> {
        const actions: PrescriptiveAction[] = [];

        // 1. Check for Expiring Items (Priority: High)
        const expiringItems = await this.getExpiringProducts(userId, 5); // 5 days threshold

        if (expiringItems.length > 0) {
            // Group by visual clutter reduction? For now, list top 3 most valuable
            const topExpiring = expiringItems
                .sort((a, b) => (b.price * b.quantity) - (a.price * a.quantity))
                .slice(0, 3);

            topExpiring.forEach(item => {
                const potentialLoss = item.price * item.quantity;
                const suggestedPrice = Number((item.price * 0.7).toFixed(2)); // 30% discount

                actions.push({
                    id: `expire-${item.id}`,
                    type: 'promo',
                    title: `Flash Sale: ${item.name}`,
                    description: `${item.quantity} units expiring soon (${new Date(item.expirationdate).toLocaleDateString()}).`,
                    impact: `Prevent loss of $${potentialLoss.toFixed(2)}`,
                    priority: 'high',
                    productId: item.id.toString(),
                    currentPrice: item.price,
                    suggestedPrice: suggestedPrice
                });
            });

            // If many items, add a summary action
            if (expiringItems.length > 3) {
                actions.push({
                    id: 'expire-bulk',
                    type: 'donate',
                    title: 'Bulk Donation Required',
                    description: `${expiringItems.length - 3} other items are expiring within 5 days.`,
                    impact: 'Compliance & Tax Benefit',
                    priority: 'medium'
                });
            }
        }

        // 2. Check for Low Stock (Mocked for now since we focus on expiration first)
        // In real implementation, this would query products where quantity < min_stock

        return actions;
    }
};
