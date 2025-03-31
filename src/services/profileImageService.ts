
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "@supabase/supabase-js/dist/module/lib/helpers";
import { toast } from "@/components/ui/use-toast";

export const profileImageService = {
  // Subir imagen de logo o portada
  async uploadProfileImage(file: File, type: 'logo' | 'cover'): Promise<string | null> {
    try {
      if (!file) return null;
      
      // Verificar el tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Solo se permiten archivos de imagen",
          variant: "destructive"
        });
        return null;
      }
      
      // Crear un nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}_${uuidv4()}.${fileExt}`;
      const filePath = `${type}/${fileName}`;
      
      // Subir el archivo al bucket
      const { data, error } = await supabase.storage
        .from('store-profile-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error("Error al subir la imagen:", error);
        toast({
          title: "Error",
          description: "No se pudo subir la imagen. Inténtalo de nuevo.",
          variant: "destructive"
        });
        return null;
      }
      
      // Obtener la URL pública de la imagen
      const { data: publicUrl } = supabase.storage
        .from('store-profile-images')
        .getPublicUrl(data.path);
      
      return publicUrl.publicUrl;
    } catch (error) {
      console.error("Error al subir la imagen del perfil:", error);
      toast({
        title: "Error",
        description: "Ocurrió un problema al procesar la imagen",
        variant: "destructive"
      });
      return null;
    }
  }
};
