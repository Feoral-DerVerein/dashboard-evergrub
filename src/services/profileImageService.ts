

import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/components/ui/use-toast";

export const profileImageService = {
  // Subir imagen de logo o portada
  async uploadProfileImage(file: File, type: 'logo' | 'cover'): Promise<string | null> {
    try {
      if (!file) return null;

      // Verificar el tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast.error("Solo se permiten archivos de imagen");
        return null;
      }

      // Crear un nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}_${uuidv4()}.${fileExt}`;
      const filePath = `store-profile-images/${type}/${fileName}`;

      const storageRef = ref(storage, filePath);

      // Subir el archivo al bucket
      await uploadBytes(storageRef, file, {
        cacheControl: '3600'
      });

      // Obtener la URL pública de la imagen
      const publicUrl = await getDownloadURL(storageRef);

      return publicUrl;
    } catch (error) {
      console.error("Error al subir la imagen del perfil:", error);
      toast.error("Ocurrió un problema al procesar la imagen");
      return null;
    }
  }
};
