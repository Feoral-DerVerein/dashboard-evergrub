
import { supabase } from "@/integrations/supabase/client";

export type Product = {
  id?: number;
  name: string;
  price: number;
  discount: number;
  description: string;
  category: string;
  brand: string;
  quantity: number;
  expirationDate: string;
  image: string;
  storeId?: string; // ID de la tienda a la que pertenece el producto
  userId: string; // ID del usuario que crea/posee el producto
};

export const productService = {
  // Obtener productos por userID (propietario de la tienda)
  async getProductsByUser(userId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('userId', userId);
    
    if (error) throw error;
    return data as Product[];
  },

  // Crear un nuevo producto
  async createProduct(product: Product): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select();
    
    if (error) throw error;
    return data[0] as Product;
  },

  // Actualizar un producto existente
  async updateProduct(id: number, updates: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0] as Product;
  },

  // Eliminar un producto
  async deleteProduct(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Subir imagen de producto
  async uploadProductImage(file: File, path: string): Promise<string> {
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
  }
};
