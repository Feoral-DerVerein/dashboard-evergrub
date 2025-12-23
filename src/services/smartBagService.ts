import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';

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
    const q = query(
      collection(db, 'smart_bags'),
      where('user_id', '==', userId),
      orderBy('created_at', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SmartBag));
  },

  async getActiveSmartBags(): Promise<SmartBag[]> {
    const q = query(
      collection(db, 'smart_bags'),
      where('is_active', '==', true),
      where('expires_at', '>', new Date().toISOString()),
      orderBy('expires_at', 'desc') // Composite index might be needed
    );
    try {
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SmartBag));
    } catch (e) {
      // Fallback if index missing
      const q2 = query(collection(db, 'smart_bags'), where('is_active', '==', true));
      const s2 = await getDocs(q2);
      const now = new Date();
      return s2.docs
        .map(d => ({ id: d.id, ...d.data() } as SmartBag))
        .filter(b => new Date(b.expires_at) > now);
    }
  },

  async getSmartBagById(id: string): Promise<SmartBag | null> {
    const docRef = doc(db, 'smart_bags', id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as SmartBag;
  },

  async createSmartBag(smartBag: Omit<SmartBag, 'id' | 'created_at' | 'updated_at' | 'current_quantity'>): Promise<SmartBag> {
    const data = {
      ...smartBag,
      current_quantity: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, 'smart_bags'), data);
    return { id: docRef.id, ...data } as SmartBag;
  },

  async updateSmartBag(id: string, updates: Partial<SmartBag>): Promise<SmartBag> {
    const docRef = doc(db, 'smart_bags', id);
    const data = { ...updates, updated_at: new Date().toISOString() };
    await updateDoc(docRef, data);
    return this.getSmartBagById(id) as Promise<SmartBag>;
  },

  async deleteSmartBag(id: string): Promise<boolean> {
    await deleteDoc(doc(db, 'smart_bags', id));
    return true;
  },

  // Customer Preferences
  async getCustomerPreferences(userId: string): Promise<CustomerPreferences | null> {
    const q = query(collection(db, 'customer_preferences'), where('user_id', '==', userId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as CustomerPreferences;
  },

  async upsertCustomerPreferences(preferences: Omit<CustomerPreferences, 'id' | 'created_at'>): Promise<CustomerPreferences> {
    const q = query(collection(db, 'customer_preferences'), where('user_id', '==', preferences.user_id));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docRef = snapshot.docs[0].ref;
      await updateDoc(docRef, { ...preferences, last_updated: new Date().toISOString() });
      return { id: docRef.id, ...snapshot.docs[0].data(), ...preferences } as CustomerPreferences;
    } else {
      const data = { ...preferences, created_at: new Date().toISOString(), last_updated: new Date().toISOString() };
      const docRef = await addDoc(collection(db, 'customer_preferences'), data);
      return { id: docRef.id, ...data } as CustomerPreferences;
    }
  },

  // Analytics
  async trackSmartBagView(smartBagId: string, customerUserId?: string, personalizedContents: any[] = []): Promise<void> {
    await addDoc(collection(db, 'smart_bag_analytics'), {
      smart_bag_id: smartBagId,
      customer_user_id: customerUserId,
      personalized_contents: personalizedContents,
      viewed_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    });
  },

  async trackSmartBagPurchase(smartBagId: string, customerUserId?: string, rating?: number, feedback?: string): Promise<void> {
    // Ideally we find the specific analytics event to update, but here we might just create a purchase event
    // or update the latest view. For simplicity, let's look for the latest view for this user/bag
    const q = query(
      collection(db, 'smart_bag_analytics'),
      where('smart_bag_id', '==', smartBagId),
      where('customer_user_id', '==', customerUserId || '')
    );
    const snapshot = await getDocs(q);
    // basic logic: update the last one
    if (!snapshot.empty) {
      const lastDoc = snapshot.docs[snapshot.size - 1]; // logic might vary
      await updateDoc(lastDoc.ref, {
        purchased_at: new Date().toISOString(),
        rating,
        feedback
      });
    }
  },

  async getSmartBagAnalytics(smartBagId: string): Promise<SmartBagAnalytics[]> {
    const q = query(
      collection(db, 'smart_bag_analytics'),
      where('smart_bag_id', '==', smartBagId),
      orderBy('created_at', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SmartBagAnalytics));
  },

  // AI Suggestions
  async generateAISuggestions(category: string, userId: string): Promise<any> {
    // Mocking AI suggestions for now or call Cloud Function if available
    console.log("Generating AI suggestions (Mocked)", category);
    return {
      suggestions: [
        { name: "Suggested Item 1", reason: "Popular" },
        { name: "Suggested Item 2", reason: "Complimentary" }
      ]
    };
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