import { supabase } from "@/integrations/supabase/client";

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
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user ads:', error);
      throw error;
    }

    return (data || []) as Ad[];
  },

  // Get all user's campaigns
  async getUserCampaigns(userId: string): Promise<AdCampaign[]> {
    const { data, error } = await supabase
      .from('ad_campaigns')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user campaigns:', error);
      throw error;
    }

    return (data || []) as AdCampaign[];
  },

  // Create new ad
  async createAd(ad: Omit<Ad, 'id' | 'created_at' | 'updated_at'>): Promise<Ad> {
    const { data, error } = await supabase
      .from('ads')
      .insert([ad])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating ad:', error);
      throw error;
    }

    return data as Ad;
  },

  // Create new campaign
  async createCampaign(campaign: Omit<AdCampaign, 'id' | 'created_at' | 'updated_at'>): Promise<AdCampaign> {
    const { data, error } = await supabase
      .from('ad_campaigns')
      .insert([campaign])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }

    return data as AdCampaign;
  },

  // Update ad
  async updateAd(id: string, updates: Partial<Ad>): Promise<Ad> {
    const { data, error } = await supabase
      .from('ads')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating ad:', error);
      throw error;
    }

    return data as Ad;
  },

  // Update campaign
  async updateCampaign(id: string, updates: Partial<AdCampaign>): Promise<AdCampaign> {
    const { data, error } = await supabase
      .from('ad_campaigns')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating campaign:', error);
      throw error;
    }

    return data as AdCampaign;
  },

  // Delete ad
  async deleteAd(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('ads')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting ad:', error);
      throw error;
    }

    return true;
  },

  // Delete campaign
  async deleteCampaign(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('ad_campaigns')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting campaign:', error);
      throw error;
    }

    return true;
  },

  // Get active ads for marketplace banner (public access)
  async getActiveMarketplaceAds(): Promise<Ad[]> {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('status', 'active')
      .eq('ad_type', 'banner')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching marketplace ads:', error);
      throw error;
    }

    return (data || []) as Ad[];
  },

  // Track ad impression
  async trackImpression(adId: string): Promise<void> {
    // Get current impressions count
    const { data: currentAd } = await supabase
      .from('ads')
      .select('impressions')
      .eq('id', adId)
      .single();

    if (currentAd) {
      // Update ad impressions
      const { error: adError } = await supabase
        .from('ads')
        .update({ 
          impressions: currentAd.impressions + 1
        })
        .eq('id', adId);

      if (adError) {
        console.error('Error tracking impression:', adError);
      }
    }

    // Then update analytics
    const today = new Date().toISOString().split('T')[0];
    
    // Get existing analytics or create new
    const { data: existingAnalytics } = await supabase
      .from('ad_analytics')
      .select('impressions')
      .eq('ad_id', adId)
      .eq('date', today)
      .single();

    const newImpressions = (existingAnalytics?.impressions || 0) + 1;
    
    const { error: analyticsError } = await supabase
      .from('ad_analytics')
      .upsert({
        ad_id: adId,
        date: today,
        impressions: newImpressions,
        clicks: existingAnalytics ? undefined : 0,
        cost: existingAnalytics ? undefined : 0
      });

    if (analyticsError) {
      console.error('Error updating analytics:', analyticsError);
    }
  },

  // Track ad click
  async trackClick(adId: string): Promise<void> {
    // Get current clicks count
    const { data: currentAd } = await supabase
      .from('ads')
      .select('clicks')
      .eq('id', adId)
      .single();

    if (currentAd) {
      // Update ad clicks
      const { error: adError } = await supabase
        .from('ads')
        .update({ 
          clicks: currentAd.clicks + 1
        })
        .eq('id', adId);

      if (adError) {
        console.error('Error tracking click:', adError);
      }
    }

    // Then update analytics
    const today = new Date().toISOString().split('T')[0];
    
    // Get existing analytics or create new
    const { data: existingAnalytics } = await supabase
      .from('ad_analytics')
      .select('clicks')
      .eq('ad_id', adId)
      .eq('date', today)
      .single();

    const newClicks = (existingAnalytics?.clicks || 0) + 1;
    
    const { error: analyticsError } = await supabase
      .from('ad_analytics')
      .upsert({
        ad_id: adId,
        date: today,
        clicks: newClicks,
        impressions: existingAnalytics ? undefined : 0,
        cost: existingAnalytics ? undefined : 0
      });

    if (analyticsError) {
      console.error('Error updating analytics:', analyticsError);
    }
  }
};

export default adsService;