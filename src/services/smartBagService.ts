import { supabase } from "@/integrations/supabase/client";

export interface SmartBag {
  id: string;
  user_id: string;
  category: string;
  name: string;
  description?: string;
  total_value: number;
  sale_price: number;
  max_quantity: number;
  current_quantity: number;
  expires_at: string;
  is_active: boolean;
  ai_suggestions: any;
  selected_products: any;
  personalization_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerPreferences {
  id: string;
  user_id: string;
  category_preferences: any;
  product_ratings: any;
  purchase_history: any;
  dietary_restrictions: string[];
  preferred_price_range: any;
  last_updated: string;
  created_at: string;
}

export interface SmartBagAnalytics {
  id: string;
  smart_bag_id: string;
  customer_user_id?: string;
  personalized_contents: any;
  viewed_at?: string;
  purchased_at?: string;
  rating?: number;
  feedback?: string;
  created_at: string;
}

export const smartBagService = {
  // Smart Bags CRUD
  async getSmartBagsByUser(userId: string): Promise<SmartBag[]> {
    const { data, error } = await supabase
      .from('smart_bags')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getActiveSmartBags(): Promise<SmartBag[]> {
    const { data, error } = await supabase
      .from('smart_bags')
      .select('*')
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getSmartBagById(id: string): Promise<SmartBag | null> {
    const { data, error } = await supabase
      .from('smart_bags')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  async createSmartBag(smartBag: Omit<SmartBag, 'id' | 'created_at' | 'updated_at' | 'current_quantity'>): Promise<SmartBag> {
    const { data, error } = await supabase
      .from('smart_bags')
      .insert({
        ...smartBag,
        current_quantity: 0
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateSmartBag(id: string, updates: Partial<SmartBag>): Promise<SmartBag> {
    const { data, error } = await supabase
      .from('smart_bags')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteSmartBag(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('smart_bags')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // Customer Preferences
  async getCustomerPreferences(userId: string): Promise<CustomerPreferences | null> {
    const { data, error } = await supabase
      .from('customer_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  async upsertCustomerPreferences(preferences: Omit<CustomerPreferences, 'id' | 'created_at'>): Promise<CustomerPreferences> {
    const { data, error } = await supabase
      .from('customer_preferences')
      .upsert(preferences, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Analytics
  async trackSmartBagView(smartBagId: string, customerUserId?: string, personalizedContents: any[] = []): Promise<void> {
    const { error } = await supabase
      .from('smart_bag_analytics')
      .insert({
        smart_bag_id: smartBagId,
        customer_user_id: customerUserId,
        personalized_contents: personalizedContents,
        viewed_at: new Date().toISOString()
      });

    if (error) throw error;
  },

  async trackSmartBagPurchase(smartBagId: string, customerUserId?: string, rating?: number, feedback?: string): Promise<void> {
    const { error } = await supabase
      .from('smart_bag_analytics')
      .update({
        purchased_at: new Date().toISOString(),
        rating,
        feedback
      })
      .eq('smart_bag_id', smartBagId)
      .eq('customer_user_id', customerUserId || '');

    if (error) throw error;
  },

  async getSmartBagAnalytics(smartBagId: string): Promise<SmartBagAnalytics[]> {
    const { data, error } = await supabase
      .from('smart_bag_analytics')
      .select('*')
      .eq('smart_bag_id', smartBagId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // AI Suggestions
  async generateAISuggestions(category: string, userId: string): Promise<any> {
    const { data, error } = await supabase.functions.invoke('generate-smart-bag-suggestions', {
      body: { category, userId }
    });

    if (error) throw error;
    return data;
  },

  // Personalization
  async getPersonalizedSmartBag(smartBagId: string, customerUserId: string): Promise<any> {
    try {
      // Get smart bag data
      const smartBag = await this.getSmartBagById(smartBagId);
      if (!smartBag) throw new Error('Smart bag not found');

      // Get customer preferences
      const preferences = await this.getCustomerPreferences(customerUserId);

      // Track the view
      await this.trackSmartBagView(smartBagId, customerUserId, smartBag.selected_products);

      // If personalization is disabled, return original
      if (!smartBag.personalization_enabled) {
        return {
          ...smartBag,
          personalized: false,
          original_contents: smartBag.selected_products
        };
      }

      // Apply basic personalization based on preferences
      let personalizedContents = [...smartBag.selected_products];

      if (preferences) {
        // Filter out products based on dietary restrictions
        if (preferences.dietary_restrictions?.length > 0) {
          personalizedContents = personalizedContents.filter(product => {
            // Simple dietary restriction check - in real app this would be more sophisticated
            const productName = product.name?.toLowerCase() || '';
            return !preferences.dietary_restrictions.some(restriction => 
              productName.includes(restriction.toLowerCase())
            );
          });
        }

        // Sort by product ratings if available
        if (preferences.product_ratings && Object.keys(preferences.product_ratings).length > 0) {
          personalizedContents.sort((a, b) => {
            const ratingA = preferences.product_ratings[a.id] || 0;
            const ratingB = preferences.product_ratings[b.id] || 0;
            return ratingB - ratingA;
          });
        }
      }

      return {
        ...smartBag,
        personalized: true,
        original_contents: smartBag.selected_products,
        personalized_contents: personalizedContents,
        customer_preferences: preferences
      };
    } catch (error) {
      console.error('Error getting personalized smart bag:', error);
      throw error;
    }
  }
};