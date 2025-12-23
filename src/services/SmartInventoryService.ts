import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc, orderBy } from "firebase/firestore";
import { predictiveAnalyticsService } from '@/services/predictiveAnalyticsService';

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

            // Firestore query
            // We need a composite index on (expirationdate ASC) effectively, 
            // but also filtering by range. 
            // Query: expirationdate > today AND expirationdate < threshold.
            const q = query(
                collection(db, 'products'),
                where('expirationdate', '>', today.toISOString()),
                where('expirationdate', '<', thresholdDate.toISOString()),
                orderBy('expirationdate', 'asc')
            );

            const snapshot = await getDocs(q);
            const products = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

            // Filter by userId if needed (though we'll rely on collection logic or future security rules)
            // Ideally we add where('userid', '==', userId) but requires composite index.
            // For now, filter in memory if strictly needed, or assume backend rules handle it.
            // Let's filter in memory since dataset is small for this prototype.
            // Actually, best practice is to add the where clause, but indexes might be missing.
            // I'll filter in JS to avoid index errors during migration.
            return products.filter((p: any) => p.userid === userId);

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
                // Update price in Firestore
                const productRef = doc(db, 'products', action.productId);
                await updateDoc(productRef, {
                    price: action.suggestedPrice
                });
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
                .sort((a: any, b: any) => (b.price * b.quantity) - (a.price * a.quantity))
                .slice(0, 3);

            topExpiring.forEach((item: any) => {
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

        // 3. Connect to Prophet Forecast (Demand Spikes)
        try {
            const predictions = await predictiveAnalyticsService.getSalesPrediction('week');

            // Analyze the trend (simple logic: is there a spike > 20% in the next 7 days?)
            const totalPredictedRevenue = predictions.reduce((sum, p) => sum + p.predicted, 0);
            const avgDaily = totalPredictedRevenue / predictions.length;

            // Check for individual day spikes
            const spikeDay = predictions.find(p => p.predicted > avgDaily * 1.3); // 30% above average

            if (spikeDay) {
                actions.push({
                    id: 'demand-spike-alert',
                    type: 'restock',
                    title: 'High Demand Expected',
                    description: `Prophet predicts a ${Math.round((spikeDay.predicted / avgDaily - 1) * 100)}% sales spike on ${new Date(spikeDay.date).toLocaleDateString()}.`,
                    impact: 'Prevent Stockouts',
                    priority: 'high'
                });
            }
        } catch (err) {
            console.error("Error fetching forecast for actions:", err);
        }

        return actions;
    }
};
