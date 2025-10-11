import { supabase } from "@/integrations/supabase/client";

export interface InventoryProduct {
  id: string;
  product_id: string;
  product_name: string;
  category: string;
  price: number;
  cost: number;
  stock_quantity: number;
  supplier?: string;
  barcode?: string;
  arrival_date?: string;
  expiration_date?: string;
  location?: any;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export const inventoryProductsService = {
  // Get all inventory products for the current user
  async getInventoryProducts(userId: string): Promise<InventoryProduct[]> {
    try {
      console.log("Fetching inventory products for user:", userId);
      
      if (!userId) {
        console.warn("No user ID provided for getInventoryProducts");
        return [];
      }
      
      const { data, error } = await supabase
        .from('inventory_products')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching inventory products:", error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} inventory products for user ${userId}`);
      return data || [];
    } catch (error) {
      console.error("Error in getInventoryProducts:", error);
      return [];
    }
  },

  // Get a single inventory product by ID
  async getInventoryProductById(id: string): Promise<InventoryProduct | null> {
    try {
      const { data, error } = await supabase
        .from('inventory_products')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching inventory product:", error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Error in getInventoryProductById:", error);
      return null;
    }
  },

  // Delete an inventory product
  async deleteInventoryProduct(id: string): Promise<boolean> {
    try {
      console.log("Deleting inventory product with ID:", id);
      const { error } = await supabase
        .from('inventory_products')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Error deleting inventory product:", error);
        throw error;
      }
      
      console.log("Inventory product deleted successfully");
      return true;
    } catch (error) {
      console.error("Error in deleteInventoryProduct:", error);
      throw error;
    }
  }
};
