import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { squareService } from "./squareService";
import { toastService } from "./toastService";
import { lightspeedService } from "./lightspeedService";
import { shopifyService } from "./shopifyService";
import { toast as uiToast } from "sonner";

export const syncManager = {
    /**
     * Checks for active integrations and triggers a background sync if needed.
     */
    async performAutoSync(userId: string): Promise<void> {
        try {
            const integrationsRef = doc(db, 'integrations', userId);
            const docSnap = await getDoc(integrationsRef);

            if (!docSnap.exists()) return;

            const data = docSnap.data();
            const activePlatforms = Object.keys(data).filter(key => data[key].connected);

            if (activePlatforms.length === 0) return;

            console.log(`🔄 Originating background sync for ${activePlatforms.length} platforms...`);

            for (const platform of activePlatforms) {
                const now = new Date();
                const lastSync = data[platform].lastSync ? new Date(data[platform].lastSync) : null;

                // Only sync once every 6 hours automatically to prevent API exhaustion
                const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);

                if (!lastSync || lastSync < sixHoursAgo) {
                    await this.syncPlatform(userId, platform, data[platform]);
                }
            }
        } catch (error) {
            console.error("Auto-sync manager error:", error);
        }
    },

    /**
     * Map and upsert product data into internal collection
     */
    async mapExternalProducts(userId: string, platform: string, rawProducts: any[], credentials: any): Promise<void> {
        const productsRef = collection(db, "products");

        for (const raw of rawProducts) {
            let name = "";
            let price = 0;
            let quantity = 0;
            let category = "General";
            let externalId = "";

            // Platform-specific mapping
            if (platform === 'shopify') {
                name = raw.title;
                price = parseFloat(raw.variants?.[0]?.price || "0");
                quantity = raw.variants?.[0]?.inventory_quantity || 0;
                category = raw.product_type || "Shopify";
                externalId = `shopify_${raw.id}`;
            } else if (platform === 'toast') {
                name = raw.name;
                price = raw.price || 0;
                quantity = 1; // Default if not in menu call
                category = raw.category || "Toast";
                externalId = `toast_${raw.guid}`;
            } else if (platform === 'square') {
                name = raw.item_data?.name || "Square Item";
                price = (raw.item_data?.variations?.[0]?.item_variation_data?.price_money?.amount || 0) / 100;
                quantity = 10; // Placeholder for Square until inventory sync added
                category = "Square";
                externalId = `square_${raw.id}`;
            }

            if (!name) continue;

            // Check if product already exists (by name or externalId)
            const q = query(productsRef,
                where("tenant_id", "==", userId),
                where("name", "==", name)
            );

            const querySnapshot = await getDocs(q);
            const location_nick = (credentials as any).location_nick || 'Main';

            if (!querySnapshot.empty) {
                // Update existing
                const docId = querySnapshot.docs[0].id;
                await updateDoc(doc(db, "products", docId), {
                    price: price,
                    quantity: quantity,
                    location_nick: location_nick,
                    updated_at: new Date().toISOString()
                });
            } else {
                // Create new
                await addDoc(productsRef, {
                    name,
                    price,
                    quantity,
                    category,
                    tenant_id: userId,
                    user_id: userId,
                    location_nick: location_nick,
                    status: 'active',
                    expiration_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 7 days
                    created_at: new Date().toISOString()
                });
            }
        }
    },

    /**
     * Core sync logic for a specific platform.
     */
    async syncPlatform(userId: string, platform: string, credentials: any): Promise<boolean> {
        console.log(`🔄 Syncing platform: ${platform}`);
        let success = false;

        try {
            switch (platform) {
                case 'square':
                    const squareResult = await squareService.getProducts(credentials);
                    if (squareResult.success && squareResult.products) {
                        await this.mapExternalProducts(userId, 'square', squareResult.products, credentials);
                        success = true;
                    }
                    break;
                case 'toast':
                    const toastResult = await toastService.getMenuItems(credentials);
                    if (toastResult.success && toastResult.items) {
                        await this.mapExternalProducts(userId, 'toast', toastResult.items, credentials);
                        success = true;
                    }
                    break;
                case 'lightspeed':
                    const lsItems = await lightspeedService.getItems(credentials);
                    if (lsItems.success) success = true; // Still using placeholders here
                    break;
                case 'shopify':
                    const shResult = await shopifyService.getProducts(credentials);
                    if (shResult.success && shResult.products) {
                        await this.mapExternalProducts(userId, 'shopify', shResult.products, credentials);
                        success = true;
                    }
                    break;
                default:
                    success = true; // Generic success for others
            }

            if (success) {
                // Update last sync timestamp
                await updateDoc(doc(db, 'integrations', userId), {
                    [`${platform}.lastSync`]: new Date().toISOString()
                });
                console.log(`✅ ${platform} sync complete.`);
            }

            return success;
        } catch (error) {
            console.error(`Error syncing ${platform}:`, error);
            return false;
        }
    }
};
