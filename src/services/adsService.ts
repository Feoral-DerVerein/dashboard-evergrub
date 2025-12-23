import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  increment,
  getDoc,
  setDoc,
  limit
} from "firebase/firestore";

export type Ad = {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  image_url?: string;
  target_url?: string;
  budget: number;
  daily_budget: number;
  total_spent: number;
  impressions: number;
  clicks: number;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'rejected';
  ad_type: 'banner' | 'sidebar' | 'popup';
  start_date?: string;
  end_date?: string;
  campaign_id?: string;
  created_at: string;
  updated_at: string;
};

export type AdCampaign = {
  id: string;
  user_id: string;
  name: string;
  objective: 'awareness' | 'traffic' | 'engagement' | 'conversions';
  budget: number;
  total_spent: number;
  status: 'draft' | 'active' | 'paused' | 'completed';
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
};

export const adsService = {
  // Get all user's ads
  async getUserAds(userId: string): Promise<Ad[]> {
    try {
      const q = query(
        collection(db, 'ads'),
        where('user_id', '==', userId),
        orderBy('created_at', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad));
    } catch (error) {
      console.error('Error fetching user ads:', error);
      throw error;
    }
  },

  // Get all user's campaigns
  async getUserCampaigns(userId: string): Promise<AdCampaign[]> {
    try {
      const q = query(
        collection(db, 'ad_campaigns'),
        where('user_id', '==', userId),
        orderBy('created_at', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdCampaign));
    } catch (error) {
      console.error('Error fetching user campaigns:', error);
      throw error;
    }
  },

  // Create new ad
  async createAd(ad: Omit<Ad, 'id' | 'created_at' | 'updated_at'>): Promise<Ad> {
    try {
      const adData = {
        ...ad,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'ads'), adData);
      return { id: docRef.id, ...adData } as Ad;
    } catch (error) {
      console.error('Error creating ad:', error);
      throw error;
    }
  },

  // Create new campaign
  async createCampaign(campaign: Omit<AdCampaign, 'id' | 'created_at' | 'updated_at'>): Promise<AdCampaign> {
    try {
      const campaignData = {
        ...campaign,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'ad_campaigns'), campaignData);
      return { id: docRef.id, ...campaignData } as AdCampaign;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  },

  // Update ad
  async updateAd(id: string, updates: Partial<Ad>): Promise<Ad> {
    try {
      const docRef = doc(db, 'ads', id);
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      await updateDoc(docRef, updateData);

      // Fetch fresh data
      const docSnap = await getDoc(docRef);
      return { id: docSnap.id, ...docSnap.data() } as Ad;
    } catch (error) {
      console.error('Error updating ad:', error);
      throw error;
    }
  },

  // Update campaign
  async updateCampaign(id: string, updates: Partial<AdCampaign>): Promise<AdCampaign> {
    try {
      const docRef = doc(db, 'ad_campaigns', id);
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      await updateDoc(docRef, updateData);

      const docSnap = await getDoc(docRef);
      return { id: docSnap.id, ...docSnap.data() } as AdCampaign;
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw error;
    }
  },

  // Delete ad
  async deleteAd(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'ads', id));
      return true;
    } catch (error) {
      console.error('Error deleting ad:', error);
      throw error;
    }
  },

  // Delete campaign
  async deleteCampaign(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'ad_campaigns', id));
      return true;
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw error;
    }
  },

  // Get active ads for marketplace banner (public access)
  async getActiveMarketplaceAds(): Promise<Ad[]> {
    try {
      const q = query(
        collection(db, 'ads'),
        where('status', '==', 'active'),
        where('ad_type', '==', 'banner'),
        orderBy('created_at', 'desc'),
        limit(5)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad));
    } catch (error) {
      console.error('Error fetching marketplace ads:', error);
      return []; // Return empty array gracefully
    }
  },

  // Track ad impression
  async trackImpression(adId: string): Promise<void> {
    try {
      const adRef = doc(db, 'ads', adId);

      // Update ad stats
      await updateDoc(adRef, {
        impressions: increment(1)
      });

      // Update daily analytics
      const today = new Date().toISOString().split('T')[0];
      const analyticsRef = doc(db, 'ad_analytics', `${adId}_${today}`);

      // Using setDoc with merge to simulate upsert
      await setDoc(analyticsRef, {
        ad_id: adId,
        date: today,
        impressions: increment(1)
      }, { merge: true });

    } catch (error) {
      console.error('Error tracking impression:', error);
    }
  },

  // Track ad click
  async trackClick(adId: string): Promise<void> {
    try {
      const adRef = doc(db, 'ads', adId);

      // Update ad stats
      await updateDoc(adRef, {
        clicks: increment(1)
      });

      // Update daily analytics
      const today = new Date().toISOString().split('T')[0];
      const analyticsRef = doc(db, 'ad_analytics', `${adId}_${today}`);

      await setDoc(analyticsRef, {
        ad_id: adId,
        date: today,
        clicks: increment(1)
      }, { merge: true });

    } catch (error) {
      console.error('Error tracking click:', error);
    }
  }
};

export default adsService;