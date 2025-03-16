
import { supabase } from "@/integrations/supabase/client";

export const productImageService = {
  // Subir imagen de producto
  async uploadProductImage(file: File, path: string): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(path, file, {
          upsert: true,
        });
      
      if (error) throw error;
      
      const { data: publicUrl } = supabase.storage
        .from('product-images')
        .getPublicUrl(path);
      
      return publicUrl.publicUrl;
    } catch (error) {
      console.error("Error uploading product image:", error);
      throw error;
    }
  }
};
