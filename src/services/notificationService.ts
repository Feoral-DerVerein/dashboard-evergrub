
import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  is_read: boolean;
  type: string;
  order_id?: string;
  for_marketplace?: boolean;
  product_id?: number;
  product_image?: string;
  product_price?: string;
}

export const notificationService = {
  async getAllNotifications(): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (error) {
        console.error("Error fetching notifications:", error);
        throw error;
      }
      
      return data as Notification[];
    } catch (error) {
      console.error("Error in getAllNotifications:", error);
      return [];
    }
  },
  
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      if (error) {
        console.error("Error marking notification as read:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in markAsRead:", error);
      throw error;
    }
  },
  
  async createOrderNotification(orderId: string, title: string, description: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          title,
          description,
          order_id: orderId,
          type: 'order'
        });
      
      if (error) {
        console.error("Error creating order notification:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in createOrderNotification:", error);
    }
  },
  
  async createWishlistNotification(productId: number, productName: string, productImage?: string, productPrice?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          title: `New wishlist item: ${productName}`,
          description: `Someone added ${productName} to their wishlist`,
          type: 'wishlist',
          product_id: productId,
          product_image: productImage,
          product_price: productPrice
        });
      
      if (error) {
        console.error("Error creating wishlist notification:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in createWishlistNotification:", error);
    }
  }
};
