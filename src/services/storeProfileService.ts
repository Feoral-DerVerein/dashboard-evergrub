
import { supabase } from "@/integrations/supabase/client";
import { StoreProfile } from "@/types/store.types";

export const storeProfileService = {
  // Get the user's store profile
  async getStoreProfile(userId: string): Promise<StoreProfile | null> {
    try {
      console.log("Fetching store profile for userId:", userId);
      
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

      console.log("Fetched store profile:", data);

      // Convert payment_details to paymentDetails if it exists
      const profile = data as any;
      if (profile.payment_details) {
        profile.paymentDetails = profile.payment_details;
        delete profile.payment_details;
        console.log("Converted payment_details to paymentDetails:", profile.paymentDetails);
      }
      
      // Safely convert to StoreProfile
      return profile as unknown as StoreProfile;
    } catch (error) {
      console.error("Error in getStoreProfile:", error);
      return null;
    }
  },
  
  // Create or update the store profile
  async saveStoreProfile(profile: StoreProfile): Promise<StoreProfile | null> {
    try {
      console.log("Saving store profile:", JSON.stringify(profile));
      
      // Create a copy of the profile to be sent to the database
      const profileToSave = { ...profile };
      
      // Convert paymentDetails to payment_details for the database
      if (profileToSave.paymentDetails) {
        console.log("Converting paymentDetails to payment_details:", profileToSave.paymentDetails);
        (profileToSave as any).payment_details = profileToSave.paymentDetails;
        delete (profileToSave as any).paymentDetails;
      }

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
      
      // Need to check if existingProfileData exists before accessing properties
      if (existingProfileData !== null) {
        // TypeScript now knows existingProfileData is not null in this block
        // Check if it's an object with an id property
        if (typeof existingProfileData === 'object') {
          // Use type assertion to tell TypeScript that existingProfileData is a record with an id property
          const typedData = existingProfileData as { id: string | number };
          
          // Now we can safely access the id property
          if (typedData.id !== null && typedData.id !== undefined) {
            existingProfile = { id: String(typedData.id) };
          }
        }
      }

      console.log("Existing profile:", existingProfile);
      
      let result;
      
      if (existingProfile && existingProfile.id) {
        // Update existing profile
        console.log("Updating existing profile with ID:", existingProfile.id);
        const { data, error } = await supabase
          .from('store_profiles' as any)
          .update({
            name: profileToSave.name,
            description: profileToSave.description,
            location: profileToSave.location,
            contactPhone: profileToSave.contactPhone,
            contactEmail: profileToSave.contactEmail,
            socialFacebook: profileToSave.socialFacebook,
            socialInstagram: profileToSave.socialInstagram,
            logoUrl: profileToSave.logoUrl,
            coverUrl: profileToSave.coverUrl,
            categories: profileToSave.categories,
            businessHours: profileToSave.businessHours,
            payment_details: (profileToSave as any).payment_details
          })
          .eq('id', existingProfile.id)
          .select()
          .single();
        
        if (error) {
          console.error("Error updating store profile:", error);
          return null;
        }
        
        result = data;
        console.log("Profile updated successfully:", result);
      } else {
        // Create a new profile
        console.log("Creating new profile");
        const { data, error } = await supabase
          .from('store_profiles' as any)
          .insert([profileToSave])
          .select()
          .single();
        
        if (error) {
          console.error("Error creating store profile:", error);
          return null;
        }
        
        result = data;
        console.log("Profile created successfully:", result);
      }
      
      // Only return as StoreProfile if we actually have a result
      if (!result) return null;
      
      // Convert payment_details back to paymentDetails if it exists
      if ((result as any).payment_details) {
        (result as any).paymentDetails = (result as any).payment_details;
        delete (result as any).payment_details;
        console.log("Converted back payment_details to paymentDetails:", (result as any).paymentDetails);
      }
      
      // Safely convert to StoreProfile
      return result as unknown as StoreProfile;
    } catch (error) {
      console.error("Error in saveStoreProfile:", error);
      return null;
    }
  }
};
