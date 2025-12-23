import { db } from "@/lib/firebase";
import { doc, updateDoc, increment, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";

export interface BusinessAction {
    type: 'discount' | 'donation';
    productId?: string;
    productName?: string;
    value?: number; // percentage for discount, quantity for donation
    target?: string; // NGO name for donation
}

export const actionExecutorService = {
    /**
     * Executes a business action triggered from the chat
     */
    async executeAction(action: BusinessAction, userId: string): Promise<boolean> {
        try {
            console.log("🚀 Executing business action:", action);

            if (action.type === 'discount') {
                return await this.applyDiscount(action, userId);
            } else if (action.type === 'donation') {
                return await this.processDonation(action, userId);
            }

            return false;
        } catch (error) {
            console.error("Error executing action:", error);
            toast.error("Error al ejecutar la acción.");
            return false;
        }
    },

    /**
     * Applies a dynamic discount to a product in Firestore
     */
    async applyDiscount(action: BusinessAction, userId: string): Promise<boolean> {
        if (!action.productId) return false;

        const productRef = doc(db, "products", action.productId);
        await updateDoc(productRef, {
            discount: action.value || 30,
            updated_at: new Date().toISOString()
        });

        toast.success(`Descuento del ${action.value}% aplicado a ${action.productName || 'el producto'}`);
        return true;
    },

    /**
     * Processes a donation and logs it to the donations collection
     */
    async processDonation(action: BusinessAction, userId: string): Promise<boolean> {
        // 1. Update product quantity (decrease)
        if (action.productId && action.value) {
            const productRef = doc(db, "products", action.productId);
            await updateDoc(productRef, {
                quantity: increment(-(action.value)),
                updated_at: new Date().toISOString()
            });
        }

        // 2. Create donation record
        await addDoc(collection(db, "donations"), {
            tenant_id: userId,
            product_name: action.productName || "Productos Variados",
            quantity: action.value || 0,
            target_ngo: action.target || "Red de Bancos de Alimentos",
            status: 'pending_pickup',
            created_at: serverTimestamp(),
            impact: {
                co2_saved: (action.value || 0) * 2.5, // Mock calculation: 2.5kg CO2 per kg food
                economic_value: (action.value || 0) * 5 // Mock calculation: 5€ per kg
            }
        });

        // 3. Phase 3: Real Notification (Mock for now, would be Slack/Email/Webhook)
        console.log(`📢 NOTIFICACION ENVIADA A ${action.target || 'ONG'}: Solicitud de recogida para ${action.productName}`);

        toast.success(`Donación confirmada para ${action.target || 'la ONG'}. ¡Gracias por reducir el desperdicio!`);
        return true;
    }
};
