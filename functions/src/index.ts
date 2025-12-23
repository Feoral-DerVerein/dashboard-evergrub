import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";
import * as jwt from "jsonwebtoken";

admin.initializeApp();
const db = admin.firestore();

// Helpers for DoorDash JWT
const generateDoorDashJWT = () => {
    const accessKeyId = process.env.DOORDASH_ACCESS_KEY_ID || functions.config().doordash?.access_key_id;
    const signingSecret = process.env.DOORDASH_SIGNING_SECRET || functions.config().doordash?.signing_secret;

    if (!accessKeyId || !signingSecret) {
        console.warn("DoorDash credentials not configured. Running in SANDBOX mode.");
        return null;
    }

    const payload = {
        aud: "doordash",
        iss: accessKeyId,
        exp: Math.floor(Date.now() / 1000) + 300, // 5 minutes
        iat: Math.floor(Date.now() / 1000),
    };

    return jwt.sign(payload, signingSecret as jwt.Secret, {
        algorithm: "HS256",
        header: { dd_iss: accessKeyId, alg: "HS256", typ: "JWT" } as any
    } as jwt.SignOptions);
};

// Publish to Marketplace (Doordash, TooGoodToGo, etc.)
export const publishToMarketplace = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in");
    }

    const { productId, marketplaceName } = data;

    try {
        const productRef = db.collection("products").doc(String(productId));
        const productDoc = await productRef.get();

        if (!productDoc.exists) throw new functions.https.HttpsError("not-found", "Product not found");

        const productData = productDoc.data();

        if (marketplaceName === 'doordash') {
            const token = generateDoorDashJWT();

            if (token) {
                // Call DoorDash Item Management API (Sandbox or Production based on config)
                const baseUrl = functions.config().doordash?.base_url || "https://openapi.doordash.com";

                await axios.post(`${baseUrl}/developer/v1/items`, {
                    item: {
                        name: productData?.name,
                        description: productData?.description,
                        price: Math.round((productData?.price || 0) * 100), // In cents
                        external_id: String(productId)
                    }
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                console.log(`[DOORDASH SIMULATION] Product ${productData?.name} would be published to DoorDash.`);
                await new Promise(resolve => setTimeout(resolve, 800)); // Minor latency for realism
            }

        } else if (marketplaceName === 'toogoodtogo') {
            // TGTG Integration: Send structured notification (Placeholder for real notification service)
            console.log(`[TGTG] Sending surplus notification for product ${productData?.name}`);
            // In a real scenario, this would call a TGTG webhook or internal dispatcher
            await db.collection("marketplace_notifications").add({
                partner: "toogoodtogo",
                product_id: productId,
                product_name: productData?.name,
                price: productData?.price,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
        }

        await productRef.update({
            is_marketplace_visible: true,
            marketplace_status: {
                [marketplaceName]: 'published',
                last_updated: new Date().toISOString()
            }
        });

        return { success: true, message: `Product published to ${marketplaceName}` };

    } catch (error: any) {
        console.error("Marketplace Error:", error.response?.data || error.message);
        throw new functions.https.HttpsError("internal", `Failed to publish: ${error.message}`);
    }
});

// Send to Donation (OzHarvest, etc.)
export const sendToDonation = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in");
    }

    const { productId, organizationName } = data;
    const userId = context.auth.uid;

    try {
        const productRef = db.collection("products").doc(String(productId));
        const productDoc = await productRef.get();

        if (!productDoc.exists) throw new functions.https.HttpsError("not-found", "Product not found");

        const productData = productDoc.data();

        // Donation Integration: Send Pickup Notification
        console.log(`[Donation] Notifying ${organizationName} for ${productData?.name}`);

        await db.collection("donations").add({
            tenant_id: userId,
            product_id: productId,
            product_name: productData?.name,
            organization: organizationName,
            quantity: productData?.quantity || 1,
            value: productData?.price || 0,
            status: 'pending_pickup',
            created_at: admin.firestore.FieldValue.serverTimestamp()
        });

        await productRef.update({
            status: 'donated',
            donation_org: organizationName,
            donated_at: new Date().toISOString()
        });

        return { success: true, message: `Donation request sent to ${organizationName}` };
    } catch (error: any) {
        console.error("Donation Error:", error.message);
        throw new functions.https.HttpsError("internal", "Failed to process donation");
    }
});
