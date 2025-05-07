
import { supabase } from "@/integrations/supabase/client";
import { StoreProfile } from "@/types/store.types";

export const storeProfileService = {
  // Get the user's store profile
  async getStoreProfile(userId: string): Promise<StoreProfile | null> {
    try {
      // Using a type assertion since the table is not in the generated types yet
      const { data, error } = await supabase
        .from('store_profiles' as any)
        .select('*')
        .eq('userId', userId)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching store profile:", error);
        return null;
      }
      
      return data as StoreProfile | null;
    } catch (error) {
      console.error("Error in getStoreProfile:", error);
      return null;
    }
  },
  
  // Create or update the store profile
  async saveStoreProfile(profile: StoreProfile): Promise<StoreProfile | null> {
    try {
      // Check if a profile already exists for this user
      const { data: existingProfileData } = await supabase
        .from('store_profiles' as any)
        .select('id')
        .eq('userId', profile.userId)
        .maybeSingle();
      
      const existingProfile = existingProfileData as { id: string } | null;
      let result;
      
      if (existingProfile?.id) {
        // Update existing profile
        const { data, error } = await supabase
          .from('store_profiles' as any)
          .update({
            name: profile.name,
            description: profile.description,
            location: profile.location,
            contactPhone: profile.contactPhone,
            contactEmail: profile.contactEmail,
            socialFacebook: profile.socialFacebook,
            socialInstagram: profile.socialInstagram,
            logoUrl: profile.logoUrl,
            coverUrl: profile.coverUrl,
            categories: profile.categories,
            businessHours: profile.businessHours,
            paymentDetails: profile.paymentDetails
          })
          .eq('id', existingProfile.id)
          .select()
          .single();
        
        if (error) {
          console.error("Error updating store profile:", error);
          return null;
        }
        
        result = data;
      } else {
        // Create a new profile
        const { data, error } = await supabase
          .from('store_profiles' as any)
          .insert([profile])
          .select()
          .single();
        
        if (error) {
          console.error("Error creating store profile:", error);
          return null;
        }
        
        result = data;
      }
      
      return result as StoreProfile | null;
    } catch (error) {
      console.error("Error in saveStoreProfile:", error);
      return null;
    }
  }
};
