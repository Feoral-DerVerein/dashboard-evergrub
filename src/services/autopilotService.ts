import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc, setDoc, orderBy, limit, onSnapshot } from 'firebase/firestore';

export interface AutopilotSettings {
  id: string;
  module_name: 'pricing' | 'promotions' | 'production' | 'inventory';
  is_active: boolean;
  last_execution?: string;
  execution_frequency: 'realtime' | 'hourly' | 'daily';
  config: any;
  created_at: string;
  updated_at: string;
}

export interface ActionLog {
  id: string;
  action_type: 'price_sync' | 'promotion_sent' | 'production_adjusted' | 'order_created' | 'inventory_reorder';
  module: string;
  description: string;
  status: 'success' | 'failed' | 'in_progress';
  metadata: any;
  created_at: string;
}

export interface PriceSyncQueue {
  id: string;
  product_id: number;
  old_price: number;
  new_price: number;
  target_system: 'pos' | 'website' | 'app' | 'all';
  sync_status: 'pending' | 'syncing' | 'completed' | 'failed';
  sync_attempts: number;
  error_message?: string;
  created_at: string;
  synced_at?: string;
}

export interface Promotion {
  id: string;
  product_id?: number;
  promotion_type: 'flash_sale' | 'expiration_alert' | 'bundle_offer' | 'clearance';
  discount_percentage: number;
  message: string;
  target_audience: 'all' | 'vip' | 'app_users' | 'email_subscribers';
  channels: string[];
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'active' | 'expired' | 'cancelled';
  sent_count: number;
  conversion_count: number;
  created_by: 'autopilot' | 'manual';
}

export interface ProductionRecommendation {
  id: string;
  product_id: number;
  date: string;
  recommended_quantity: number;
  current_planned_quantity: number;
  confidence_score: number;
  factors: any;
  status: 'pending' | 'accepted' | 'rejected' | 'auto_applied';
  created_at: string;
  applied_at?: string;
}

export interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier_id?: string;
  supplier_name: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'sent' | 'received' | 'cancelled';
  order_date: string;
  expected_delivery?: string;
  total_amount: number;
  items: any[];
  created_by: 'autopilot' | 'manual';
  approved_by?: string;
  approval_required: boolean;
}

export interface ReorderRule {
  id: string;
  product_id: number;
  supplier_id?: string;
  min_stock_level: number;
  reorder_quantity: number;
  lead_time_days: number;
  is_active: boolean;
  last_order_date?: string;
}

class AutopilotService {
  // ============= SETTINGS =============
  async getSettings(): Promise<AutopilotSettings[]> {
    // Return mock data for demo purposes if DB empty, or implement fetch
    // Implementing fetch from Firestore if user is auth
    const user = auth.currentUser;
    if (!user) return []; // Or throw

    try {
      const q = query(collection(db, 'autopilot_settings'), where('user_id', '==', user.uid));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AutopilotSettings));
      }

      return [
        { id: 'set-1', module_name: 'pricing', is_active: true, last_execution: new Date(Date.now() - 30 * 60 * 1000).toISOString(), execution_frequency: 'hourly', config: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'set-2', module_name: 'promotions', is_active: true, last_execution: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), execution_frequency: 'daily', config: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'set-3', module_name: 'production', is_active: false, execution_frequency: 'daily', config: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'set-4', module_name: 'inventory', is_active: true, last_execution: new Date(Date.now() - 60 * 60 * 1000).toISOString(), execution_frequency: 'hourly', config: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ] as AutopilotSettings[];

    } catch (e) {
      return [];
    }
  }

  async updateSettings(moduleName: string, updates: Partial<AutopilotSettings>): Promise<AutopilotSettings> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    // ID strategy: user_id_module_name
    const docId = `${user.uid}_${moduleName}`;
    const docRef = doc(db, 'autopilot_settings', docId);

    const data = {
      user_id: user.uid,
      module_name: moduleName,
      ...updates
    };

    await setDoc(docRef, data, { merge: true });
    return { id: docId, ...data } as AutopilotSettings;
  }

  // ============= ACTION LOGS =============
  async getActionLogs(limitCount: number = 50): Promise<ActionLog[]> {
    const user = auth.currentUser;
    // Return mock data if no user or no data
    if (!user) return [];

    try {
      const q = query(
        collection(db, 'action_logs'),
        where('user_id', '==', user.uid),
        orderBy('created_at', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ActionLog));
      }
    } catch (e) {
      console.warn("Error fetching action logs, using mock", e);
    }

    // fallback mock
    const logs: ActionLog[] = [
      { id: 'log-1', action_type: 'price_sync', module: 'pricing', description: 'Precio sincronizado para Croissant: $4.50 → $3.60', status: 'success', metadata: { product_id: 1 }, created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
      { id: 'log-2', action_type: 'promotion_sent', module: 'promotions', description: '3 promociones de expiración enviadas', status: 'success', metadata: { count: 3 }, created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
      { id: 'log-3', action_type: 'inventory_reorder', module: 'inventory', description: 'Orden de compra automática creada para Leche', status: 'success', metadata: { product: 'Leche', quantity: 50 }, created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
      { id: 'log-4', action_type: 'price_sync', module: 'pricing', description: 'Precio sincronizado para Ensalada César: $12.00 → $9.60', status: 'success', metadata: { product_id: 3 }, created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
      { id: 'log-5', action_type: 'order_created', module: 'inventory', description: 'Orden de compra PO-12345 enviada al proveedor', status: 'in_progress', metadata: { order_id: 'PO-12345' }, created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() },
    ];
    return logs.slice(0, limitCount);
  }

  async createActionLog(log: Omit<ActionLog, 'id' | 'created_at'>): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    await addDoc(collection(db, 'action_logs'), {
      ...log,
      user_id: user.uid,
      created_at: new Date().toISOString()
    });
  }

  // ============= PRICE SYNC QUEUE =============
  async getPriceSyncQueue(): Promise<PriceSyncQueue[]> {
    const user = auth.currentUser;
    if (!user) return [];

    try {
      const q = query(
        collection(db, 'price_sync_queue'),
        where('user_id', '==', user.uid),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PriceSyncQueue));
    } catch (e) { }

    // Return mock data for demo purposes
    return [
      { id: 'sync-1', product_id: 1, old_price: 4.50, new_price: 3.60, target_system: 'all', sync_status: 'completed', sync_attempts: 1, created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), synced_at: new Date(Date.now() - 25 * 60 * 1000).toISOString() },
      { id: 'sync-2', product_id: 3, old_price: 12.00, new_price: 9.60, target_system: 'pos', sync_status: 'pending', sync_attempts: 0, created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
      { id: 'sync-3', product_id: 4, old_price: 3.50, new_price: 2.80, target_system: 'website', sync_status: 'syncing', sync_attempts: 1, created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
      { id: 'sync-4', product_id: 2, old_price: 4.50, new_price: 5.00, target_system: 'app', sync_status: 'failed', sync_attempts: 3, error_message: 'Connection timeout', created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    ];
  }

  async addToPriceSyncQueue(item: Omit<PriceSyncQueue, 'id' | 'created_at' | 'sync_attempts' | 'sync_status'>): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    await addDoc(collection(db, 'price_sync_queue'), {
      ...item,
      user_id: user.uid,
      created_at: new Date().toISOString(),
      sync_attempts: 0,
      sync_status: 'pending'
    });
  }

  async processPriceSyncQueue(): Promise<{ processed: number; failed: number }> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const q = query(
      collection(db, 'price_sync_queue'),
      where('user_id', '==', user.uid),
      where('sync_status', '==', 'pending'),
      limit(10)
    );
    const snapshot = await getDocs(q);

    let processed = 0;
    let failed = 0;

    for (const docSnap of snapshot.docs) {
      const item = docSnap.data() as PriceSyncQueue;
      try {
        // Update price in products table
        // Note: product_id is number in interface vs string in id. Assuming string ID for Firestore.
        if (item.product_id) {
          // Find product by "numeric" ID if stored that way, or just update using ID
          // If products use Firestore auto-ids, we need to map product_id (number) to doc ID.
          // For now, assuming product_id refers to a numeric field in 'products' collection.
          const pq = query(collection(db, 'products'), where('id', '==', item.product_id));
          const psnap = await getDocs(pq);
          if (!psnap.empty) {
            await updateDoc(psnap.docs[0].ref, { price: item.new_price }); // Assuming 'price' field name
          }
        }

        // Mark as completed
        await updateDoc(docSnap.ref, {
          sync_status: 'completed',
          synced_at: new Date().toISOString(),
        });

        processed++;

        // Log the action
        await this.createActionLog({
          action_type: 'price_sync',
          module: 'pricing',
          description: `Price synced for product ${item.product_id}: $${item.old_price} → $${item.new_price}`,
          status: 'success',
          metadata: { product_id: item.product_id, target_system: item.target_system },
        });
      } catch (error: any) {
        failed++;
        // Mark as failed
        await updateDoc(docSnap.ref, {
          sync_status: 'failed',
          sync_attempts: (item.sync_attempts || 0) + 1,
          error_message: error.message || 'Unknown error',
        });
      }
    }

    return { processed, failed };
  }

  // ============= PROMOTIONS =============
  async getPromotions(): Promise<Promotion[]> {
    const q = query(collection(db, 'promotions'), orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Promotion));
  }

  async createPromotion(promotion: Omit<Promotion, 'id' | 'sent_count' | 'conversion_count'>): Promise<Promotion> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const data = {
      ...promotion,
      user_id: user.uid,
      sent_count: 0,
      conversion_count: 0,
      // created_at: new Date().toISOString() // Should be in promotion type?
    };
    const docRef = await addDoc(collection(db, 'promotions'), data);
    return { id: docRef.id, ...data } as Promotion;
  }

  async activateExpiringSoonPromotions(): Promise<{ created: number; products: string[] }> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    // Get products expiring within 2 days
    const today = new Date();
    const twoDaysLater = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);

    // Firestore range query
    const q = query(
      collection(db, 'products'),
      where('userid', '==', user.uid),
      where('expirationdate', '>=', today.toISOString()),
      where('expirationdate', '<=', twoDaysLater.toISOString())
    );
    const snapshot = await getDocs(q);
    const products = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    let created = 0;
    const productNames: string[] = [];

    for (const product of products as any[]) {
      // Check if promotion already exists
      const pq = query(
        collection(db, 'promotions'),
        where('product_id', '==', product.id),
        where('promotion_type', '==', 'expiration_alert'),
        where('status', '==', 'active'),
        limit(1)
      );
      const existingSnap = await getDocs(pq);

      if (existingSnap.empty) {
        await this.createPromotion({
          product_id: product.id,
          promotion_type: 'expiration_alert',
          discount_percentage: 30,
          message: `¡Última oportunidad! ${product.name} con 30% de descuento. Vence pronto.`,
          target_audience: 'all',
          channels: ['email', 'push'],
          start_time: new Date().toISOString(),
          end_time: product.expirationdate,
          status: 'active',
          created_by: 'autopilot',
        });

        created++;
        productNames.push(product.name);
      }
    }

    if (created > 0) {
      await this.createActionLog({
        action_type: 'promotion_sent',
        module: 'promotions',
        description: `${created} promociones de expiración creadas automáticamente`,
        status: 'success',
        metadata: { products: productNames },
      });
    }

    return { created, products: productNames };
  }

  // ============= PRODUCTION RECOMMENDATIONS =============
  async getProductionRecommendations(): Promise<ProductionRecommendation[]> {
    const q = query(collection(db, 'production_recommendations'), orderBy('date', 'desc'), limit(30));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ProductionRecommendation));
  }

  async createProductionRecommendation(
    rec: Omit<ProductionRecommendation, 'id' | 'created_at'>
  ): Promise<ProductionRecommendation> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const data = { ...rec, user_id: user.uid, created_at: new Date().toISOString() };
    const docRef = await addDoc(collection(db, 'production_recommendations'), data);
    return { id: docRef.id, ...data } as ProductionRecommendation;
  }

  // ============= REORDER RULES & PURCHASE ORDERS =============
  async getReorderRules(): Promise<ReorderRule[]> {
    const q = query(collection(db, 'reorder_rules'), where('is_active', '==', true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ReorderRule));
  }

  async createReorderRule(rule: Omit<ReorderRule, 'id' | 'created_at' | 'updated_at'>): Promise<ReorderRule> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const data = { ...rule, user_id: user.uid, created_at: new Date().toISOString() };
    const docRef = await addDoc(collection(db, 'reorder_rules'), data);
    return { id: docRef.id, ...data } as ReorderRule;
  }

  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    const q = query(collection(db, 'purchase_orders'), orderBy('order_date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PurchaseOrder));
  }

  async createPurchaseOrder(order: Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at'>): Promise<PurchaseOrder> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const data = { ...order, user_id: user.uid, created_at: new Date().toISOString() };
    const docRef = await addDoc(collection(db, 'purchase_orders'), data);
    return { id: docRef.id, ...data } as PurchaseOrder;
  }

  async checkInventoryAndReorder(): Promise<{ orders_created: number }> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const rules = await this.getReorderRules();
    let ordersCreated = 0;

    for (const rule of rules) {
      // Get current stock
      // Assuming product_id matches document ID roughly or via query
      // If product_id is number, we need query.
      const pq = query(collection(db, 'products'), where('id', '==', rule.product_id));
      const psnap = await getDocs(pq);

      if (!psnap.empty) {
        const product = psnap.docs[0].data();

        if (product && product.quantity <= rule.min_stock_level) {
          // Create purchase order
          const orderNumber = `PO-${Date.now()}-${rule.product_id}`;

          await this.createPurchaseOrder({
            order_number: orderNumber,
            supplier_name: 'Proveedor Automático',
            status: 'draft',
            order_date: new Date().toISOString(),
            expected_delivery: new Date(Date.now() + rule.lead_time_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            total_amount: 0,
            items: [{
              product_id: rule.product_id,
              product_name: product.name,
              quantity: rule.reorder_quantity,
            }],
            created_by: 'autopilot',
            approval_required: true,
          });

          ordersCreated++;

          await this.createActionLog({
            action_type: 'order_created',
            module: 'inventory',
            description: `Orden de compra automática creada para ${product.name} (Stock: ${product.quantity})`,
            status: 'success',
            metadata: { product_id: rule.product_id, quantity: rule.reorder_quantity },
          });
        }
      }
    }

    return { orders_created: ordersCreated };
  }

  // ============= REALTIME SUBSCRIPTION =============
  setupRealtimeSubscription(onAction: (payload: any) => void) {
    const q = query(
      collection(db, 'action_logs'),
      orderBy('created_at', 'desc'),
      limit(1)
    );

    // Firestore realtime listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          console.log("Autopilot action (realtime):", change.doc.data());
          onAction({ new: change.doc.data() });
        }
      });
    });

    return () => {
      unsubscribe();
    };
  }
}

export const autopilotService = new AutopilotService();
