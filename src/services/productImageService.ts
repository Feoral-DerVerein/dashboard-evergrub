
import { supabase } from "@/integrations/supabase/client";

export const productImageService = {
  // Subir imagen de producto
  async uploadProductImage(file: File | Blob, path: string): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(path, file, {
          upsert: true,
          contentType: (file as any).type || undefined,
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
  },
  
  // Subir imagen desde una URL (descarga y sube a Storage)
  async uploadImageFromUrl(url: string, path: string): Promise<string> {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
      const blob = await res.blob();

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(path, blob, {
          upsert: true,
          contentType: blob.type || 'image/jpeg',
        });

      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from('product-images')
        .getPublicUrl(path);

      return publicUrl.publicUrl;
    } catch (error) {
      console.error('Error uploading image from URL:', error);
      throw error;
    }
  }
};
