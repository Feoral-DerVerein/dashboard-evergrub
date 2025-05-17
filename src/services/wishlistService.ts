
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface WishlistItem {
  id: string;
  product_id: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  product_data: any;
}

export const wishlistService = {
  async addToWishlist(productId: number, productData: any) {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error("User not authenticated");
    }
    
    const { data, error } = await supabase.from('wishlists').insert({
      product_id: productId.toString(),
      user_id: user.user.id,
      product_data: productData
    });
    
    if (error) {
      console.error("Error adding to wishlist:", error);
      throw error;
    }
    
    return data;
  },
  
  async isInWishlist(productId: number): Promise<boolean> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      return false;
    }
    
    const { data, error } = await supabase.from('wishlists')
      .select()
      .eq('product_id', productId.toString())
      .eq('user_id', user.user.id)
      .maybeSingle();
    
    if (error) {
      console.error("Error checking wishlist:", error);
      return false;
    }
    
    return !!data;
  },
  
  async getWishlistItems(): Promise<WishlistItem[]> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      return [];
    }
    
    const { data, error } = await supabase.from('wishlists')
      .select()
      .eq('user_id', user.user.id);
    
    if (error) {
      console.error("Error fetching wishlist:", error);
      return [];
    }
    
    return data || [];
  },
  
  async removeFromWishlist(productId: number): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error("User not authenticated");
    }
    
    const { error } = await supabase.from('wishlists')
      .delete()
      .eq('product_id', productId.toString())
      .eq('user_id', user.user.id);
    
    if (error) {
      console.error("Error removing from wishlist:", error);
      throw error;
    }
  }
};
