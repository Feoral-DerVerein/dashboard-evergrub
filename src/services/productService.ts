
import { supabase } from "@/integrations/supabase/client";
import { Product, DbProduct, SAFFIRE_FREYCINET_STORE_ID } from "@/types/product.types";
import { mapDbProductToProduct, mapProductToDbProduct } from "@/utils/product.mappers";
import { productImageService } from "./productImageService";

// Use 'export type' for type re-exports when isolatedModules is enabled
export type { Product } from "@/types/product.types";
export { SAFFIRE_FREYCINET_STORE_ID } from "@/types/product.types";
export { productImageService } from "./productImageService";

export const productService = {
  // Get product by ID
  async getProductById(id: number): Promise<Product | null> {
    try {
      console.log("Fetching product with ID:", id);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error("Error fetching product by ID:", error);
        throw error;
      }
      
      if (!data) {
        console.log("No product found with ID:", id);
        return null;
      }
      
      console.log("Product fetched:", data);
      return mapDbProductToProduct(data as DbProduct);
    } catch (error) {
      console.error("Error in getProductById:", error);
      throw error;
    }
  },

  // Obtener productos por userID (propietario de la tienda)
  async getProductsByUser(userId: string): Promise<Product[]> {
    try {
      console.log("Fetching products for user:", userId);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('userid', userId);
      
      if (error) {
        console.error("Error fetching products:", error);
        throw error;
      }
      
      if (!data) {
        console.log("No data returned");
        return [];
      }
      
      console.log("Products fetched:", data);
      return (data as DbProduct[]).map(mapDbProductToProduct);
    } catch (error) {
      console.error("Error in getProductsByUser:", error);
      throw error;
    }
  },

  // Obtener todos los productos (para marketplace)
  async getAllProducts(): Promise<Product[]> {
    try {
      console.log("Fetching all products");
      const { data, error } = await supabase
        .from('products')
        .select('*');
      
      if (error) {
        console.error("Error fetching all products:", error);
        throw error;
      }
      
      console.log("All products fetched:", data ? data.length : 0);
      return (data as DbProduct[]).map(mapDbProductToProduct);
    } catch (error) {
      console.error("Error in getAllProducts:", error);
      throw error;
    }
  },

  // Obtener productos por storeId
  async getProductsByStore(storeId: string): Promise<Product[]> {
    try {
      console.log(`Fetching products for store: ${storeId}`);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('storeid', storeId);
      
      if (error) {
        console.error("Error fetching store products:", error);
        throw error;
      }
      
      console.log(`Products for store ${storeId} fetched:`, data ? data.length : 0);
      return (data as DbProduct[]).map(mapDbProductToProduct);
    } catch (error) {
      console.error("Error in getProductsByStore:", error);
      throw error;
    }
  },

  // Obtener productos específicamente de la tienda Saffire Freycinet
  async getSaffreFreycinetProducts(): Promise<Product[]> {
    try {
      console.log("Fetching Saffire Freycinet products with store ID:", SAFFIRE_FREYCINET_STORE_ID);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('storeid', SAFFIRE_FREYCINET_STORE_ID);
      
      if (error) {
        console.error("Error fetching Saffire Freycinet products:", error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log("No Saffire Freycinet products found");
        console.log("Let's check RLS permissions and the storeid value");
        
        // Verificar todos los productos para diagnóstico
        const allProds = await supabase.from('products').select('*');
        console.log("All accessible products:", allProds.data);
        
        return [];
      }
      
      console.log("Saffire Freycinet products fetched:", data.length);
      console.log("Product samples:", data.slice(0, 2));
      return (data as DbProduct[]).map(mapDbProductToProduct);
    } catch (error) {
      console.error("Error in getSaffreFreycinetProducts:", error);
      throw error;
    }
  },

  // Crear un nuevo producto
  async createProduct(product: Product): Promise<Product> {
    try {
      // Asegurar que el producto se asigne a Saffire Freycinet
      const productWithStore = {
        ...product,
        storeId: SAFFIRE_FREYCINET_STORE_ID
      };
      
      console.log("Creating product with data:", productWithStore);
      const dbProduct = mapProductToDbProduct(productWithStore);
      console.log("Mapped to DB product:", dbProduct);
      
      const { data, error } = await supabase
        .from('products')
        .insert([dbProduct])
        .select();
      
      if (error) {
        console.error("Error creating product:", error);
        throw error;
      }
      
      console.log("Product created successfully:", data[0]);
      return mapDbProductToProduct(data[0] as DbProduct);
    } catch (error) {
      console.error("Error in createProduct:", error);
      throw error;
    }
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
    
    // Siempre asegurar que el producto pertenezca a Saffire Freycinet
    dbUpdates.storeid = SAFFIRE_FREYCINET_STORE_ID;
    
    try {
      console.log("Updating product ID:", id);
      console.log("With updates:", dbUpdates);
      
      const { data, error } = await supabase
        .from('products')
        .update(dbUpdates)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error("Error updating product:", error);
        throw error;
      }
      
      console.log("Product updated successfully:", data[0]);
      return mapDbProductToProduct(data[0] as DbProduct);
    } catch (error) {
      console.error("Error in updateProduct:", error);
      throw error;
    }
  },

  // Eliminar un producto
  async deleteProduct(id: number): Promise<boolean> {
    try {
      console.log("Deleting product with ID:", id);
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Error deleting product:", error);
        throw error;
      }
      
      console.log("Product deleted successfully");
      return true;
    } catch (error) {
      console.error("Error in deleteProduct:", error);
      throw error;
    }
  },

  // Re-export image upload function
  uploadProductImage: productImageService.uploadProductImage
};
