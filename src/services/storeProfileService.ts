
import { supabase } from "@/integrations/supabase/client";
import { StoreProfile } from "@/types/store.types";

export const storeProfileService = {
  // Obtener el perfil de la tienda del usuario
  async getStoreProfile(userId: string): Promise<StoreProfile | null> {
    try {
      // Using a type assertion to bypass TypeScript's strict table typing
      const { data, error } = await (supabase
        .from('store_profiles') as any)
        .select('*')
        .eq('userId', userId)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching store profile:", error);
        return null;
      }
      
      return data as StoreProfile;
    } catch (error) {
      console.error("Error in getStoreProfile:", error);
      return null;
    }
  },
  
  // Crear o actualizar el perfil de la tienda
  async saveStoreProfile(profile: StoreProfile): Promise<StoreProfile | null> {
    try {
      // Verificar si ya existe un perfil para este usuario
      const { data: existingProfile } = await (supabase
        .from('store_profiles') as any)
        .select('id')
        .eq('userId', profile.userId)
        .maybeSingle();
      
      let result;
      
      if (existingProfile?.id) {
        // Actualizar el perfil existente
        const { data, error } = await (supabase
          .from('store_profiles') as any)
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
            businessHours: profile.businessHours
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
        // Crear un nuevo perfil
        const { data, error } = await (supabase
          .from('store_profiles') as any)
          .insert([profile])
          .select()
          .single();
        
        if (error) {
          console.error("Error creating store profile:", error);
          return null;
        }
        
        result = data;
      }
      
      return result as StoreProfile;
    } catch (error) {
      console.error("Error in saveStoreProfile:", error);
      return null;
    }
  }
};
