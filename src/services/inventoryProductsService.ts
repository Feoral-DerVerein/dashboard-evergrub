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
  async getInventoryProducts(userId: string): Promise<InventoryProduct[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        //         .eq('userid', userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching inventory products:", error);
        throw error;
      }

      return (data || []).map((product) => ({
        id: product.id.toString(),
        product_id: product.id.toString(),
        product_name: product.name,
        category: product.category,
        price: Number(product.price),
        cost: Number(product.original_price || product.price),
        stock_quantity: product.quantity,
        supplier: product.brand || undefined,
        barcode: product.ean || product.sku || undefined,
        arrival_date: product.created_at,
        expiration_date: product.expirationdate,
        location: product.pickup_location || undefined,
        user_id: product.userid,
        created_at: product.created_at,
        updated_at: product.created_at,
      }));
    } catch (error) {
      console.error("Error in getInventoryProducts:", error);
      return [];
    }
  },

  async getInventoryProductById(id: string): Promise<InventoryProduct | null> {
    try {
      const { data, error } = await supabase.from("products").select("*").eq("id", parseInt(id)).single();

      if (error) {
        console.error("Error fetching inventory product:", error);
        return null;
      }

      if (!data) return null;

      return {
        id: data.id.toString(),
        product_id: data.id.toString(),
        product_name: data.name,
        category: data.category,
        price: Number(data.price),
        cost: Number(data.original_price || data.price),
        stock_quantity: data.quantity,
        supplier: data.brand || undefined,
        barcode: data.ean || data.sku || undefined,
        arrival_date: data.created_at,
        expiration_date: data.expirationdate,
        location: data.pickup_location || undefined,
        user_id: data.userid,
        created_at: data.created_at,
        updated_at: data.created_at,
      };
    } catch (error) {
      console.error("Error in getInventoryProductById:", error);
      return null;
    }
  },

  async deleteInventoryProduct(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("products").delete().eq("id", parseInt(id));

      if (error) {
        console.error("Error deleting inventory product:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in deleteInventoryProduct:", error);
      return false;
    }
  },
};
