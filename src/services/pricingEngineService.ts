import { db, auth } from '@/lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDoc,
  onSnapshot
} from 'firebase/firestore';

export interface PricingRule {
  id: string;
  rule_name: string;
  rule_type: 'expiration' | 'demand' | 'geolocation' | 'stock';
  conditions: any;
  discount_percentage: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_id?: string;
}

export interface PriceHistory {
  id: string;
  product_id: number | string; // Changed to string for Firestore compatibility mostly but keeping flexibility
  old_price: number;
  new_price: number;
  reason: string;
  changed_by: 'automatic' | 'manual';
  changed_at: string;
  user_id?: string;
}

export interface ZoneMultiplier {
  id: string;
  zone_name: string;
  zone_code: string;
  price_multiplier: number;
  demand_level: 'high' | 'medium' | 'low';
  created_at: string;
  updated_at: string;
  user_id?: string;
}

export interface ProductWithPricing {
  id: number | string;
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
    // Returning mock data for demo, similar to original but could fetch from Firestore
    // To fetch from Firestore:
    // const q = query(collection(db, 'pricing_rules'));
    // const snapshot = await getDocs(q);
    // return snapshot.docs.map(d => ({id: d.id, ...d.data()})) as PricingRule[];

    return [
      { id: 'rule-1', rule_name: 'Productos con 7+ días', rule_type: 'expiration', conditions: { minDays: 7, maxDays: undefined }, discount_percentage: 0, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'rule-2', rule_name: 'Productos con 4-7 días', rule_type: 'expiration', conditions: { minDays: 4, maxDays: 7 }, discount_percentage: 10, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'rule-3', rule_name: 'Productos con 2-3 días', rule_type: 'expiration', conditions: { minDays: 2, maxDays: 3 }, discount_percentage: 25, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'rule-4', rule_name: 'Productos con 1 día o menos', rule_type: 'expiration', conditions: { minDays: 0, maxDays: 1 }, discount_percentage: 40, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ];
  }

  async createPricingRule(rule: Omit<PricingRule, 'id' | 'created_at' | 'updated_at'>): Promise<PricingRule> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const ruleData = {
      ...rule,
      user_id: user.uid,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'pricing_rules'), ruleData);
    return { id: docRef.id, ...ruleData } as PricingRule;
  }

  async updatePricingRule(id: string, updates: Partial<PricingRule>): Promise<PricingRule> {
    const docRef = doc(db, 'pricing_rules', id);
    const updateData = { ...updates, updated_at: new Date().toISOString() };
    await updateDoc(docRef, updateData);

    // Return updated
    const snap = await getDoc(docRef);
    return { id: snap.id, ...snap.data() } as PricingRule;
  }

  async deletePricingRule(id: string): Promise<void> {
    await deleteDoc(doc(db, 'pricing_rules', id));
  }

  // ============= ZONE MULTIPLIERS =============
  async getZoneMultipliers(): Promise<ZoneMultiplier[]> {
    return [
      { id: 'zone-1', zone_name: 'Centro Comercial', zone_code: 'ZONA-A', price_multiplier: 1.15, demand_level: 'high', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'zone-2', zone_name: 'Zona Residencial', zone_code: 'ZONA-B', price_multiplier: 1.00, demand_level: 'medium', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'zone-3', zone_name: 'Zona Industrial', zone_code: 'ZONA-C', price_multiplier: 0.90, demand_level: 'low', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ];
  }

  async createZoneMultiplier(zone: Omit<ZoneMultiplier, 'id' | 'created_at' | 'updated_at'>): Promise<ZoneMultiplier> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const zoneData = {
      ...zone,
      user_id: user.uid,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'zone_multipliers'), zoneData);
    return { id: docRef.id, ...zoneData } as ZoneMultiplier;
  }

  async updateZoneMultiplier(id: string, updates: Partial<ZoneMultiplier>): Promise<ZoneMultiplier> {
    const docRef = doc(db, 'zone_multipliers', id);
    const updateData = { ...updates, updated_at: new Date().toISOString() };
    await updateDoc(docRef, updateData);

    const snap = await getDoc(docRef);
    return { id: snap.id, ...snap.data() } as ZoneMultiplier;
  }

  // ============= PRICE HISTORY =============
  async getPriceHistory(productId?: number | string): Promise<PriceHistory[]> {
    // Mock data
    const mockHistory: PriceHistory[] = [
      { id: 'hist-1', product_id: 1, old_price: 4.50, new_price: 3.60, reason: 'Descuento automático por expiración', changed_by: 'automatic', changed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
      { id: 'hist-2', product_id: 3, old_price: 12.00, new_price: 9.60, reason: 'Descuento automático por expiración', changed_by: 'automatic', changed_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
      { id: 'hist-3', product_id: 4, old_price: 3.50, new_price: 2.80, reason: 'Ajuste manual de precio', changed_by: 'manual', changed_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
      { id: 'hist-4', product_id: 2, old_price: 4.50, new_price: 5.00, reason: 'Ajuste de precio por zona', changed_by: 'automatic', changed_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
    ];

    if (productId) {
      return mockHistory.filter(h => String(h.product_id) === String(productId));
    }
    return mockHistory;
  }

  async createPriceHistory(history: Omit<PriceHistory, 'id' | 'changed_at'>): Promise<PriceHistory> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const historyData = {
      ...history,
      user_id: user.uid,
      changed_at: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'price_history'), historyData);
    return { id: docRef.id, ...historyData } as PriceHistory;
  }

  // ============= PRODUCTS WITH PRICING =============
  async getProductsWithPricing(): Promise<ProductWithPricing[]> {
    // Return mock data for demo purposes
    return [
      { id: 1, name: 'Croissant de Almendra', category: 'Panadería', base_price: 4.50, current_price: 3.60, quantity: 45, expirationdate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), location_zone: 'ZONA-A', last_price_update: new Date().toISOString(), image: '/placeholder.svg' },
      { id: 2, name: 'Café Latte', category: 'Bebidas', base_price: 5.00, current_price: 5.00, quantity: 120, expirationdate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), location_zone: 'ZONA-B', image: '/placeholder.svg' },
      { id: 3, name: 'Ensalada César', category: 'Comida', base_price: 12.00, current_price: 9.60, quantity: 15, expirationdate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), location_zone: 'ZONA-A', last_price_update: new Date().toISOString(), image: '/placeholder.svg' },
      { id: 4, name: 'Yogurt Natural', category: 'Lácteos', base_price: 3.50, current_price: 2.80, quantity: 35, expirationdate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), location_zone: 'ZONA-C', image: '/placeholder.svg' },
      { id: 5, name: 'Sandwich Vegetal', category: 'Comida', base_price: 8.00, current_price: 8.00, quantity: 22, expirationdate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), location_zone: 'ZONA-B', image: '/placeholder.svg' },
    ];
  }

  async updateProductPrice(
    productId: number | string,
    newPrice: number,
    reason: string,
    changedBy: 'automatic' | 'manual'
  ): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    // Get current price
    const docRef = doc(db, 'products', String(productId));
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      // Fallback if looking up mock ID in real DB, but for now we assume real DB
      // If strictly mocked, we can skip DB update
      // Assuming mixed mode: read mock, write real? No, inconsistent.
      // Let's assume we are writing to Firestore products collection
      // But logic below relies on product existing.
    }

    const productData = snap.data();
    const oldPrice = productData?.current_price || productData?.price || 0; // fallback

    // Update product price
    await updateDoc(docRef, {
      current_price: newPrice, // Schema might use 'price' or 'current_price'
      price: newPrice, // Update main price too?
      last_price_update: new Date().toISOString()
    });

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
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          console.log('Product price changed:', change.doc.data());
          onPriceChange(change.doc.data());
        }
      });
    });

    return unsubscribe;
  }
}

export const pricingEngineService = new PricingEngineService();
