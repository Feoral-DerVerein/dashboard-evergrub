
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

export const productImageService = {
  async uploadImage(file: File, customPath?: string): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = customPath || `products/${fileName}`;

      const storageRef = ref(storage, filePath);
      await uploadBytes(storageRef, file);
      const publicUrl = await getDownloadURL(storageRef);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading product image:', error);
      throw error;
    }
  },

  async uploadImageFromUrl(url: string, customPath?: string): Promise<string> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const fileName = `${uuidv4()}.jpg`; // Assuming images from URL are typically JPG, or infer from content-type if available
      const filePath = customPath || `products/${fileName}`;

      const storageRef = ref(storage, filePath);
      await uploadBytes(storageRef, blob);
      const publicUrl = await getDownloadURL(storageRef);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image from URL:', error);
      throw error;
    }
  }
};
