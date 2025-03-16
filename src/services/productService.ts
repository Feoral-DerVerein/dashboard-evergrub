
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

// Type mapping to fix the mismatch between database and client-side types
type DbProduct = {
  id: number;
  name: string;
  price: number;
  discount: number;
  description: string;
  category: string;
  brand: string;
  quantity: number;
  expirationdate: string; // Note lowercase 'd'
  image: string;
  storeid: string | null; // Note lowercase 'id'
  userid: string; // Note lowercase 'id'
  created_at: string;
};

// Convert database product to client product
const mapDbProductToProduct = (dbProduct: DbProduct): Product => ({
  id: dbProduct.id,
  name: dbProduct.name,
  price: dbProduct.price,
  discount: dbProduct.discount,
  description: dbProduct.description,
  category: dbProduct.category,
  brand: dbProduct.brand,
  quantity: dbProduct.quantity,
  expirationDate: dbProduct.expirationdate,
  image: dbProduct.image,
  storeId: dbProduct.storeid || undefined,
  userId: dbProduct.userid
});

// Convert client product to database product
const mapProductToDbProduct = (product: Product): Omit<DbProduct, 'id' | 'created_at'> => ({
  name: product.name,
  price: product.price,
  discount: product.discount,
  description: product.description,
  category: product.category,
  brand: product.brand,
  quantity: product.quantity,
  expirationdate: product.expirationDate,
  image: product.image,
  storeid: product.storeId || null,
  userid: product.userId
});

export const productService = {
  // Obtener productos por userID (propietario de la tienda)
  async getProductsByUser(userId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('userid', userId);
    
    if (error) throw error;
    return (data as DbProduct[]).map(mapDbProductToProduct);
  },

  // Crear un nuevo producto
  async createProduct(product: Product): Promise<Product> {
    const dbProduct = mapProductToDbProduct(product);
    
    const { data, error } = await supabase
      .from('products')
      .insert([dbProduct])
      .select();
    
    if (error) throw error;
    return mapDbProductToProduct(data[0] as DbProduct);
  },

  // Actualizar un producto existente
  async updateProduct(id: number, updates: Partial<Product>): Promise<Product> {
    // Map partial Product updates to partial DbProduct updates
    const dbUpdates: Partial<DbProduct> = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.discount !== undefined) dbUpdates.discount = updates.discount;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.brand !== undefined) dbUpdates.brand = updates.brand;
    if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
    if (updates.expirationDate !== undefined) dbUpdates.expirationdate = updates.expirationDate;
    if (updates.image !== undefined) dbUpdates.image = updates.image;
    if (updates.storeId !== undefined) dbUpdates.storeid = updates.storeId || null;
    
    const { data, error } = await supabase
      .from('products')
      .update(dbUpdates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return mapDbProductToProduct(data[0] as DbProduct);
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
