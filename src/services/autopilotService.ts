import { supabase } from '@/integrations/supabase/client';

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
    const { data, error } = await supabase
      .from('autopilot_settings')
      .select('*')
      .order('module_name');

    if (error) throw error;
    return (data || []) as AutopilotSettings[];
  }

  async updateSettings(moduleName: string, updates: Partial<AutopilotSettings>): Promise<AutopilotSettings> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('autopilot_settings')
      .upsert({
        user_id: user.id,
        module_name: moduleName,
        ...updates,
      }, {
        onConflict: 'user_id,module_name'
      })
      .select()
      .single();

    if (error) throw error;
    return data as AutopilotSettings;
  }

  // ============= ACTION LOGS =============
  async getActionLogs(limit: number = 50): Promise<ActionLog[]> {
    const { data, error } = await supabase
      .from('action_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as ActionLog[];
  }

  async createActionLog(log: Omit<ActionLog, 'id' | 'created_at'>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('action_logs')
      .insert([{ ...log, user_id: user.id }]);

    if (error) throw error;
  }

  // ============= PRICE SYNC QUEUE =============
  async getPriceSyncQueue(): Promise<PriceSyncQueue[]> {
    const { data, error } = await supabase
      .from('price_sync_queue')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return (data || []) as PriceSyncQueue[];
  }

  async addToPriceSyncQueue(item: Omit<PriceSyncQueue, 'id' | 'created_at' | 'sync_attempts' | 'sync_status'>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('price_sync_queue')
      .insert([{ ...item, user_id: user.id }]);

    if (error) throw error;
  }

  async processPriceSyncQueue(): Promise<{ processed: number; failed: number }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: pending, error: fetchError } = await supabase
      .from('price_sync_queue')
      .select('*')
      .eq('user_id', user.id)
      .eq('sync_status', 'pending')
      .limit(10);

    if (fetchError) throw fetchError;

    let processed = 0;
    let failed = 0;

    for (const item of pending || []) {
      try {
        // Update price in products table
        const { error: updateError } = await supabase
          .from('products')
          .update({ current_price: item.new_price })
          .eq('id', item.product_id);

        if (updateError) throw updateError;

        // Mark as completed
        await supabase
          .from('price_sync_queue')
          .update({
            sync_status: 'completed',
            synced_at: new Date().toISOString(),
          })
          .eq('id', item.id);

        processed++;

        // Log the action
        await this.createActionLog({
          action_type: 'price_sync',
          module: 'pricing',
          description: `Price synced for product ${item.product_id}: $${item.old_price} → $${item.new_price}`,
          status: 'success',
          metadata: { product_id: item.product_id, target_system: item.target_system },
        });
      } catch (error) {
        failed++;
        // Mark as failed
        await supabase
          .from('price_sync_queue')
          .update({
            sync_status: 'failed',
            sync_attempts: item.sync_attempts + 1,
            error_message: error instanceof Error ? error.message : 'Unknown error',
          })
          .eq('id', item.id);
      }
    }

    return { processed, failed };
  }

  // ============= PROMOTIONS =============
  async getPromotions(): Promise<Promotion[]> {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Promotion[];
  }

  async createPromotion(promotion: Omit<Promotion, 'id' | 'sent_count' | 'conversion_count'>): Promise<Promotion> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('promotions')
      .insert([{ ...promotion, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data as Promotion;
  }

  async activateExpiringSoonPromotions(): Promise<{ created: number; products: string[] }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get products expiring within 2 days
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, price, expirationdate')
      .eq('userid', user.id)
      .gte('expirationdate', new Date().toISOString())
      .lte('expirationdate', new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;

    let created = 0;
    const productNames: string[] = [];

    for (const product of products || []) {
      // Check if promotion already exists
      const { data: existing } = await supabase
        .from('promotions')
        .select('id')
        .eq('product_id', product.id)
        .eq('promotion_type', 'expiration_alert')
        .eq('status', 'active')
        .single();

      if (!existing) {
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
    const { data, error } = await supabase
      .from('production_recommendations')
      .select('*')
      .order('date', { ascending: false })
      .limit(30);

    if (error) throw error;
    return (data || []) as ProductionRecommendation[];
  }

  async createProductionRecommendation(
    rec: Omit<ProductionRecommendation, 'id' | 'created_at'>
  ): Promise<ProductionRecommendation> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('production_recommendations')
      .insert([{ ...rec, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data as ProductionRecommendation;
  }

  // ============= REORDER RULES & PURCHASE ORDERS =============
  async getReorderRules(): Promise<ReorderRule[]> {
    const { data, error } = await supabase
      .from('reorder_rules')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    return (data || []) as ReorderRule[];
  }

  async createReorderRule(rule: Omit<ReorderRule, 'id' | 'created_at' | 'updated_at'>): Promise<ReorderRule> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('reorder_rules')
      .insert([{ ...rule, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data as ReorderRule;
  }

  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*')
      .order('order_date', { ascending: false });

    if (error) throw error;
    return (data || []) as PurchaseOrder[];
  }

  async createPurchaseOrder(order: Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at'>): Promise<PurchaseOrder> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('purchase_orders')
      .insert([{ ...order, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data as PurchaseOrder;
  }

  async checkInventoryAndReorder(): Promise<{ orders_created: number }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const rules = await this.getReorderRules();
    let ordersCreated = 0;

    for (const rule of rules) {
      // Get current stock
      const { data: product } = await supabase
        .from('products')
        .select('quantity, name')
        .eq('id', rule.product_id)
        .single();

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

    return { orders_created: ordersCreated };
  }

  // ============= REALTIME SUBSCRIPTION =============
  setupRealtimeSubscription(onAction: (payload: any) => void) {
    const channel = supabase
      .channel('autopilot-actions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'action_logs',
        },
        (payload) => {
          console.log('Autopilot action:', payload);
          onAction(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const autopilotService = new AutopilotService();
