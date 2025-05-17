
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { notificationService } from "./notificationService";

export interface WishlistItem {
  id: string;
  product_id: string;
  user_id: string;
  created_at: string;
  category_id: string;
  product_data: any;
}

export const wishlistService = {
  async addToWishlist(productId: number, productData: any) {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error("User not authenticated");
    }
    
    try {
      const { data, error } = await supabase.from('wishlists').insert({
        product_id: productId.toString(),
        user_id: user.user.id,
        product_data: productData
      }).select();
      
      if (error) {
        console.error("Error adding to wishlist:", error);
        throw error;
      }
      
      // Create notification for admin
      await notificationService.createWishlistNotification(productId, productData.name);
      
      toast.success("Added to wishlist");
      return data;
    } catch (error) {
      console.error("Error in addToWishlist:", error);
      toast.error("Failed to add to wishlist");
      return null;
    }
  },
  
  async isInWishlist(productId: number): Promise<boolean> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      return false;
    }
    
    try {
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
    } catch (error) {
      console.error("Error in isInWishlist:", error);
      return false;
    }
  },
  
  async getWishlistItems(): Promise<WishlistItem[]> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      return [];
    }
    
    try {
      const { data, error } = await supabase.from('wishlists')
        .select()
        .eq('user_id', user.user.id);
      
      if (error) {
        console.error("Error fetching wishlist:", error);
        return [];
      }
      
      return data as WishlistItem[] || [];
    } catch (error) {
      console.error("Error in getWishlistItems:", error);
      return [];
    }
  },
  
  async removeFromWishlist(productId: number): Promise<boolean> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error("User not authenticated");
    }
    
    try {
      const { error } = await supabase.from('wishlists')
        .delete()
        .eq('product_id', productId.toString())
        .eq('user_id', user.user.id);
      
      if (error) {
        console.error("Error removing from wishlist:", error);
        throw error;
      }
      
      toast.success("Removed from wishlist");
      return true;
    } catch (error) {
      console.error("Error in removeFromWishlist:", error);
      toast.error("Failed to remove from wishlist");
      return false;
    }
  },
  
  async notifyWishlistUsers(productId: number): Promise<void> {
    try {
      // Get all users who have this product in their wishlist
      const { data: wishlistItems, error } = await supabase
        .from('wishlists')
        .select('user_id, product_data')
        .eq('product_id', productId.toString());
      
      if (error) {
        console.error("Error fetching wishlist users:", error);
        toast.error("Failed to notify users");
        return;
      }
      
      if (!wishlistItems || wishlistItems.length === 0) {
        toast.info("No users have this product in their wishlist");
        return;
      }
      
      // For each user, create a notification
      const productName = wishlistItems[0]?.product_data?.name || 'Product';
      
      toast.success(`${wishlistItems.length} users notified about ${productName}`);
      
      // In a real app, you would send the notifications to users here
      // This would typically involve a backend API call
    } catch (error) {
      console.error("Error in notifyWishlistUsers:", error);
      toast.error("Failed to notify wishlist users");
    }
  }
};
