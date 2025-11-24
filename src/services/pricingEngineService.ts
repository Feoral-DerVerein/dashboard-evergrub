import { supabase } from '@/integrations/supabase/client';

export interface PricingRule {
  id: string;
  rule_name: string;
  rule_type: 'expiration' | 'demand' | 'geolocation' | 'stock';
  conditions: any;
  discount_percentage: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PriceHistory {
  id: string;
  product_id: number;
  old_price: number;
  new_price: number;
  reason: string;
  changed_by: 'automatic' | 'manual';
  changed_at: string;
}

export interface ZoneMultiplier {
  id: string;
  zone_name: string;
  zone_code: string;
  price_multiplier: number;
  demand_level: 'high' | 'medium' | 'low';
  created_at: string;
  updated_at: string;
}

export interface ProductWithPricing {
  id: number;
  name: string;
  category: string;
  base_price: number;
  current_price: number;
  cost?: number;
  quantity: number;
  expirationdate: string;
  location_zone?: string;
  last_price_update?: string;
  image: string;
}

class PricingEngineService {
  // ============= PRICING RULES =============
  async getPricingRules(): Promise<PricingRule[]> {
    const { data, error } = await supabase
      .from('pricing_rules')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as PricingRule[];
  }

  async createPricingRule(rule: Omit<PricingRule, 'id' | 'created_at' | 'updated_at'>): Promise<PricingRule> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('pricing_rules')
      .insert([{ ...rule, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data as PricingRule;
  }

  async updatePricingRule(id: string, updates: Partial<PricingRule>): Promise<PricingRule> {
    const { data, error } = await supabase
      .from('pricing_rules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as PricingRule;
  }

  async deletePricingRule(id: string): Promise<void> {
    const { error } = await supabase
      .from('pricing_rules')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ============= ZONE MULTIPLIERS =============
  async getZoneMultipliers(): Promise<ZoneMultiplier[]> {
    const { data, error } = await supabase
      .from('zone_multipliers')
      .select('*')
      .order('zone_name');

    if (error) throw error;
    return (data || []) as ZoneMultiplier[];
  }

  async createZoneMultiplier(zone: Omit<ZoneMultiplier, 'id' | 'created_at' | 'updated_at'>): Promise<ZoneMultiplier> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('zone_multipliers')
      .insert([{ ...zone, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data as ZoneMultiplier;
  }

  async updateZoneMultiplier(id: string, updates: Partial<ZoneMultiplier>): Promise<ZoneMultiplier> {
    const { data, error } = await supabase
      .from('zone_multipliers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ZoneMultiplier;
  }

  // ============= PRICE HISTORY =============
  async getPriceHistory(productId?: number): Promise<PriceHistory[]> {
    let query = supabase
      .from('price_history')
      .select('*')
      .order('changed_at', { ascending: false })
      .limit(100);

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as PriceHistory[];
  }

  async createPriceHistory(history: Omit<PriceHistory, 'id' | 'changed_at'>): Promise<PriceHistory> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('price_history')
      .insert([{ ...history, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data as PriceHistory;
  }

  // ============= PRODUCTS WITH PRICING =============
  async getProductsWithPricing(): Promise<ProductWithPricing[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('products')
      .select('id, name, category, base_price, current_price, cost, quantity, expirationdate, location_zone, last_price_update, image')
      .eq('userid', user.id)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async updateProductPrice(
    productId: number,
    newPrice: number,
    reason: string,
    changedBy: 'automatic' | 'manual'
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get current price
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('current_price, base_price')
      .eq('id', productId)
      .single();

    if (fetchError) throw fetchError;

    const oldPrice = product.current_price || product.base_price;

    // Update product price
    const { error: updateError } = await supabase
      .from('products')
      .update({ 
        current_price: newPrice,
        last_price_update: new Date().toISOString()
      })
      .eq('id', productId);

    if (updateError) throw updateError;

    // Create history record
    await this.createPriceHistory({
      product_id: productId,
      old_price: oldPrice,
      new_price: newPrice,
      reason,
      changed_by: changedBy,
    });
  }

  // ============= AUTOMATION FUNCTIONS =============
  async checkExpirationPricing(): Promise<{ updated: number; products: string[] }> {
    const products = await this.getProductsWithPricing();
    const rules = await this.getPricingRules();
    const expirationRules = rules.filter(r => r.is_active && r.rule_type === 'expiration');

    if (expirationRules.length === 0) {
      return { updated: 0, products: [] };
    }

    let updatedCount = 0;
    const updatedProducts: string[] = [];

    for (const product of products) {
      if (!product.expirationdate || !product.base_price) continue;

      const expiryDate = new Date(product.expirationdate);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry < 0) continue; // Already expired

      let applicableDiscount = 0;

      // Apply rules based on days until expiry
      for (const rule of expirationRules) {
        const conditions = rule.conditions as { minDays?: number; maxDays?: number };
        if (
          (conditions.minDays === undefined || daysUntilExpiry >= conditions.minDays) &&
          (conditions.maxDays === undefined || daysUntilExpiry <= conditions.maxDays)
        ) {
          applicableDiscount = Math.max(applicableDiscount, rule.discount_percentage);
        }
      }

      if (applicableDiscount > 0) {
        const newPrice = product.base_price * (1 - applicableDiscount / 100);
        const currentPrice = product.current_price || product.base_price;

        // Only update if price changed significantly (more than 1%)
        if (Math.abs(newPrice - currentPrice) / currentPrice > 0.01) {
          await this.updateProductPrice(
            product.id,
            Number(newPrice.toFixed(2)),
            `Descuento automático por expiración (${daysUntilExpiry} días restantes) - ${applicableDiscount}% off`,
            'automatic'
          );
          updatedCount++;
          updatedProducts.push(product.name);
        }
      }
    }

    return { updated: updatedCount, products: updatedProducts };
  }

  async applyZonePricing(zoneCode: string, newMultiplier: number): Promise<{ updated: number; products: string[] }> {
    const products = await this.getProductsWithPricing();
    const zoneProducts = products.filter(p => p.location_zone === zoneCode);

    let updatedCount = 0;
    const updatedProducts: string[] = [];

    for (const product of zoneProducts) {
      if (!product.base_price) continue;

      const newPrice = product.base_price * newMultiplier;
      const currentPrice = product.current_price || product.base_price;

      // Only update if price changed
      if (Math.abs(newPrice - currentPrice) > 0.01) {
        await this.updateProductPrice(
          product.id,
          Number(newPrice.toFixed(2)),
          `Ajuste de precio por zona (Multiplicador: ${newMultiplier}x)`,
          'automatic'
        );
        updatedCount++;
        updatedProducts.push(product.name);
      }
    }

    return { updated: updatedCount, products: updatedProducts };
  }

  // ============= REALTIME SUBSCRIPTION =============
  setupRealtimeSubscription(onPriceChange: (payload: any) => void) {
    const channel = supabase
      .channel('price-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
        },
        (payload) => {
          console.log('Product price changed:', payload);
          onPriceChange(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const pricingEngineService = new PricingEngineService();
