
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Notification {
  id: string;
  type: string;
  title: string;
  description: string;
  is_read: boolean;
  order_id?: string;
  product_id?: number;
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
      const isMarketplaceOrder = orderData && (orderData.user_id === null || orderData.from_orders_page === true);
      
      if (isMarketplaceOrder) {
        console.log("This is a marketplace order, creating notification");
        
        const { data, error: notificationError } = await supabase
          .from('notifications')
          .insert({
            type: 'order',
            title: 'Order Status Updated',
            description: message,
            is_read: false,
            order_id: orderId,
            for_marketplace: true,
            timestamp: new Date().toISOString()
          })
          .select();
          
        if (notificationError) {
          console.error("Error creating notification:", notificationError);
          toast.error("Failed to create notification");
          return;
        }
        
        console.log("Notification created successfully for marketplace:", data);
        
        // Display a toast notification
        toast.info(message, {
          description: `Order #${orderId.substring(0, 8)} status updated`
        });
      } else {
        console.log("Not a marketplace order, skipping notification creation");
      }
    } catch (error) {
      console.error("Error in createOrderNotification:", error);
      toast.error("Failed to create order notification");
    }
  },
  
  // Create a pickup notification when an order is completed
  async createPickupNotification(orderId: string): Promise<void> {
    try {
      // Get order information
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
        
      if (orderError) {
        console.error("Error getting order information for pickup notification:", orderError);
        toast.error("Failed to create pickup notification");
        return;
      }
      
      // Check if this is a marketplace order (no user_id) or from orders page
      const isMarketplaceOrder = orderData && (orderData.user_id === null || orderData.from_orders_page === true);
      
      if (isMarketplaceOrder) {
        console.log("Creating pickup notification for completed marketplace order");
        
        const notificationMessage = `Your order #${orderId.substring(0, 8)} is completed and ready for pickup.`;
        
        const { data, error: notificationError } = await supabase
          .from('notifications')
          .insert({
            type: 'pickup',
            title: 'Product Ready for Pickup',
            description: notificationMessage,
            is_read: false,
            order_id: orderId,
            for_marketplace: true,
            timestamp: new Date().toISOString()
          })
          .select();
          
        if (notificationError) {
          console.error("Error creating pickup notification:", notificationError);
          toast.error("Failed to create pickup notification");
          return;
        }
        
        console.log("Pickup notification created successfully:", data);
        
        // Display a toast notification
        toast.success("Order Ready for Pickup", {
          description: notificationMessage
        });
      } else {
        console.log("Not a marketplace order, skipping pickup notification");
      }
    } catch (error) {
      console.error("Error in createPickupNotification:", error);
      toast.error("Failed to create pickup notification");
    }
  },
  
  // Create a sales notification when an order is completed
  async createSalesNotification(orderId: string, total: number): Promise<void> {
    try {
      console.log(`Creating sales notification for completed order ${orderId} with total ${total}`);
      
      const notificationMessage = `Order #${orderId.substring(0, 8)} completed for $${total.toFixed(2)}`;
      
      const { data, error: notificationError } = await supabase
        .from('notifications')
        .insert({
          type: 'sales',
          title: 'New Sale Completed',
          description: notificationMessage,
          is_read: false,
          order_id: orderId,
          for_marketplace: false,
          timestamp: new Date().toISOString()
        })
        .select();
        
      if (notificationError) {
        console.error("Error creating sales notification:", notificationError);
        toast.error("Failed to create sales notification");
        return;
      }
        
      console.log("Sales notification created successfully:", data);
      
      // Display a toast notification
      toast.success("New Sale Completed", {
        description: notificationMessage
      });
    } catch (error) {
      console.error("Error in createSalesNotification:", error);
      toast.error("Failed to create sales notification");
    }
  },

  // Create a product expiration notification
  async createProductExpirationNotification(productId: number, productName: string, daysUntilExpiry: number): Promise<void> {
    try {
      console.log(`Creating expiration notification for product ${productName} (ID: ${productId})`);
      
      const notificationMessage = `${productName} will expire in ${daysUntilExpiry} days`;
      
      const { data, error: notificationError } = await supabase
        .from('notifications')
        .insert({
          type: 'expiration',
          title: 'Product Expiration Warning',
          description: notificationMessage,
          is_read: false,
          product_id: productId,
          for_marketplace: false,
          timestamp: new Date().toISOString()
        })
        .select();
        
      if (notificationError) {
        console.error("Error creating expiration notification:", notificationError);
        toast.error("Failed to create expiration notification");
        return;
      }
        
      console.log("Expiration notification created successfully:", data);
      
      // Display a toast notification
      toast.warning("Product Expiration Warning", {
        description: notificationMessage
      });
    } catch (error) {
      console.error("Error in createProductExpirationNotification:", error);
      toast.error("Failed to create product expiration notification");
    }
  },
  
  // Create a user purchase notification
  async createUserPurchaseNotification(orderId: string, customerName: string, total: number): Promise<void> {
    try {
      console.log(`Creating user purchase notification for order ${orderId}`);
      
      const notificationMessage = `${customerName} made a purchase of $${total.toFixed(2)}`;
      
      const { data, error: notificationError } = await supabase
        .from('notifications')
        .insert({
          type: 'purchase',
          title: 'New Customer Purchase',
          description: notificationMessage,
          is_read: false,
          order_id: orderId,
          for_marketplace: true,
          timestamp: new Date().toISOString()
        })
        .select();
        
      if (notificationError) {
        console.error("Error creating purchase notification:", notificationError);
        toast.error("Failed to create purchase notification");
        return;
      }
        
      console.log("Purchase notification created successfully:", data);
      
      // Display a toast notification
      toast.info("New Customer Purchase", {
        description: notificationMessage
      });
    } catch (error) {
      console.error("Error in createUserPurchaseNotification:", error);
      toast.error("Failed to create user purchase notification");
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
        toast.error("Failed to load notifications");
        return [];
      }
      
      return data as Notification[];
    } catch (error) {
      console.error("Error in getMarketplaceNotifications:", error);
      toast.error("Failed to load notifications");
      return [];
    }
  },
  
  // Get all notifications (marketplace and non-marketplace)
  async getAllNotifications(): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('timestamp', { ascending: false });
        
      if (error) {
        console.error("Error fetching all notifications:", error);
        toast.error("Failed to load notifications");
        return [];
      }
      
      return data as Notification[];
    } catch (error) {
      console.error("Error in getAllNotifications:", error);
      toast.error("Failed to load notifications");
      return [];
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
        toast.error("Failed to mark notification as read");
      }
    } catch (error) {
      console.error("Error in markAsRead:", error);
      toast.error("Failed to mark notification as read");
    }
  }
};
