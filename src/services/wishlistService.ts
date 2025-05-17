
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Heart } from "lucide-react";

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: number;
  product_data: any;
  created_at: string;
}

export const wishlistService = {
  // Add product to wishlist
  async addToWishlist(productId: number, productData: any): Promise<boolean> {
    try {
      const { data: existingItem, error: checkError } = await supabase
        .from('wishlists')
        .select('*')
        .eq('product_id', productId.toString())
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking wishlist item:", checkError);
        toast.error("Failed to check wishlist status");
        return false;
      }

      // If product already exists in wishlist
      if (existingItem) {
        toast("Already in wishlist", {
          description: "This product is already in your wishlist",
          icon: <Heart className="h-4 w-4 text-red-500" />
        });
        return false;
      }

      // Add to wishlist
      const { data, error } = await supabase
        .from('wishlists')
        .insert({
          product_id: productId.toString(),
          product_data: productData,
        })
        .select();

      if (error) {
        console.error("Error adding to wishlist:", error);
        toast.error("Failed to add to wishlist");
        return false;
      }

      toast.success("Added to wishlist", {
        description: "Product has been added to your wishlist",
        icon: <Heart className="h-4 w-4 text-red-500 fill-red-500" />
      });
      
      // Create notification for admin
      await createWishlistNotification(productData.name);
      
      return true;
    } catch (error) {
      console.error("Error in addToWishlist:", error);
      toast.error("Failed to add to wishlist");
      return false;
    }
  },

  // Remove product from wishlist
  async removeFromWishlist(productId: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('product_id', productId.toString());

      if (error) {
        console.error("Error removing from wishlist:", error);
        toast.error("Failed to remove from wishlist");
        return false;
      }

      toast.success("Removed from wishlist", {
        description: "Product has been removed from your wishlist"
      });
      return true;
    } catch (error) {
      console.error("Error in removeFromWishlist:", error);
      toast.error("Failed to remove from wishlist");
      return false;
    }
  },

  // Check if product is in wishlist
  async isInWishlist(productId: number): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('id')
        .eq('product_id', productId.toString())
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error checking wishlist status:", error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error("Error in isInWishlist:", error);
      return false;
    }
  },

  // Get all wishlist items
  async getWishlistItems(): Promise<WishlistItem[]> {
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching wishlist items:", error);
        toast.error("Failed to load wishlist items");
        return [];
      }

      return data as WishlistItem[];
    } catch (error) {
      console.error("Error in getWishlistItems:", error);
      toast.error("Failed to load wishlist items");
      return [];
    }
  },

  // Notify users about wishlist items
  async notifyWishlistUsers(productId: number): Promise<boolean> {
    try {
      // Get product details
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (productError) {
        console.error("Error getting product information:", productError);
        toast.error("Failed to get product information");
        return false;
      }

      // Create notification for all users who have this product in wishlist
      const { data: wishlistItems, error: wishlistError } = await supabase
        .from('wishlists')
        .select('*')
        .eq('product_id', productId.toString());

      if (wishlistError) {
        console.error("Error getting wishlist items:", wishlistError);
        toast.error("Failed to get users with this item in wishlist");
        return false;
      }

      if (wishlistItems && wishlistItems.length > 0) {
        // Create notifications for each user
        const notificationsToInsert = wishlistItems.map(item => ({
          type: 'wishlist',
          title: 'Product Available!',
          description: `${product.name} is now available for purchase.`,
          is_read: false,
          product_id: productId,
          for_marketplace: true,
          timestamp: new Date().toISOString()
        }));

        const { error: notificationError } = await supabase
          .from('notifications')
          .insert(notificationsToInsert);
          
        if (notificationError) {
          console.error("Error creating wishlist notifications:", notificationError);
          toast.error("Failed to notify users");
          return false;
        }
        
        toast.success(`${wishlistItems.length} users notified`, {
          description: `Notification sent about ${product.name}`
        });
        return true;
      } else {
        toast.info("No users to notify", {
          description: "No users have this product in their wishlist"
        });
        return false;
      }
    } catch (error) {
      console.error("Error in notifyWishlistUsers:", error);
      toast.error("Failed to notify users");
      return false;
    }
  }
};

// Create an internal notification for admin about a new wishlist addition
async function createWishlistNotification(productName: string): Promise<void> {
  try {
    await supabase
      .from('notifications')
      .insert({
        type: 'wishlist',
        title: 'New Wishlist Addition',
        description: `A user added ${productName} to their wishlist.`,
        is_read: false,
        for_marketplace: false,
        timestamp: new Date().toISOString()
      });
  } catch (error) {
    console.error("Error creating wishlist notification:", error);
  }
}
