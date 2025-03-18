import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string;
  type: string;
  title: string;
  description: string;
  is_read: boolean;
  order_id?: string;
  for_marketplace: boolean;
  timestamp: string;
}

export const notificationService = {
  // Create a notification for a marketplace order
  async createOrderNotification(orderId: string, message: string): Promise<void> {
    try {
      console.log(`Creating notification for order ${orderId}`);
      
      // Get order information to determine if it's a marketplace order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
        
      if (orderError) {
        console.error("Error getting order information for notification:", orderError);
        throw orderError;
      }
      
      // Check if this is a marketplace order (no user_id)
      if (orderData && orderData.user_id === null) {
        console.log("This is a marketplace order, creating notification");
        
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            type: 'order',
            title: 'Order Status Updated',
            description: message,
            is_read: false,
            order_id: orderId,
            for_marketplace: true,
            timestamp: new Date().toISOString()
          });
          
        if (notificationError) {
          console.error("Error creating notification:", notificationError);
          throw notificationError;
        }
        
        console.log("Notification created successfully for marketplace");
      }
    } catch (error) {
      console.error("Error in createOrderNotification:", error);
      throw error;
    }
  },
  
  // Get marketplace notifications
  async getMarketplaceNotifications(): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('for_marketplace', true)
        .order('timestamp', { ascending: false });
        
      if (error) {
        console.error("Error fetching marketplace notifications:", error);
        throw error;
      }
      
      return data as Notification[];
    } catch (error) {
      console.error("Error in getMarketplaceNotifications:", error);
      throw error;
    }
  },
  
  // Mark notification as read
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
  
  // Subscribe to real-time notifications
  subscribeToNotifications(callback: (notification: Notification) => void) {
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: 'for_marketplace=eq.true',
        },
        (payload) => {
          console.log('New notification received:', payload);
          callback(payload.new as Notification);
        }
      )
      .subscribe();
      
    return channel;
  }
};
