
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
      
      // Only return as StoreProfile if we actually have data
      if (!data) return null;
      
      // Safely convert to StoreProfile
      return data as unknown as StoreProfile;
    } catch (error) {
      console.error("Error in getStoreProfile:", error);
      return null;
    }
  },
  
  // Create or update the store profile
  async saveStoreProfile(profile: StoreProfile): Promise<StoreProfile | null> {
    try {
      // Check if a profile already exists for this user
      const { data: existingProfileData, error: fetchError } = await supabase
        .from('store_profiles' as any)
        .select('id')
        .eq('userId', profile.userId)
        .maybeSingle();
      
      if (fetchError) {
        console.error("Error checking for existing profile:", fetchError);
        return null;
      }
      
      // Safely handle existingProfileData
      let existingProfile = null;
      
      // Handle the null case properly - only proceed with the checks if existingProfileData is not null
      if (existingProfileData !== null) {
        // Now TypeScript knows existingProfileData is not null for the code inside this block
        if (typeof existingProfileData === 'object' && 
            'id' in existingProfileData && 
            existingProfileData.id !== null) {
          existingProfile = { id: String(existingProfileData.id) };
        }
      }

      let result;
      
      if (existingProfile && existingProfile.id) {
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
      
      // Only return as StoreProfile if we actually have a result
      if (!result) return null;
      
      // Safely convert to StoreProfile
      return result as unknown as StoreProfile;
    } catch (error) {
      console.error("Error in saveStoreProfile:", error);
      return null;
    }
  }
};
