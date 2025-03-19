
import { supabase } from "@/integrations/supabase/client";
import { Order, OrderItem } from "@/types/order.types";
import { toast } from "sonner";

interface UpdateOrderItemParams {
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  name: string;
  category: string | null;
}

export const createOrderItem = async (orderItem: OrderItem) => {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .insert([orderItem])
      .select();

    if (error) {
      console.error("Error creating order item:", error);
      toast.error("Error creating order item. Something went wrong. Please try again.");
      return { success: false, error };
    }

    console.log("Order item created successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Exception creating order item:", error);
    toast.error("Unexpected error. Please check the console for details.");
    return { success: false, error };
  }
};

export const updateOrderItem = async (
  order_id: string,
  product_id: string,
  updates: Partial<Omit<UpdateOrderItemParams, 'product_id'>>
) => {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .update(updates)
      .eq('order_id', order_id)
      .eq('product_id', product_id)
      .select();

    if (error) {
      console.error("Error updating order item:", error);
      toast.error("Error updating order item. Something went wrong. Please try again.");
      return { success: false, error };
    }

    console.log("Order item updated successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Exception updating order item:", error);
    toast.error("Unexpected error. Please check the console for details.");
    return { success: false, error };
  }
};

export const deleteOrderItem = async (order_id: string, product_id: string) => {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', order_id)
      .eq('product_id', product_id);

    if (error) {
      console.error("Error deleting order item:", error);
      toast.error("Error deleting order item. Something went wrong. Please try again.");
      return { success: false, error };
    }

    console.log("Order item deleted successfully");
    return { success: true, data };
  } catch (error) {
    console.error("Exception deleting order item:", error);
    toast.error("Unexpected error. Please check the console for details.");
    return { success: false, error };
  }
};

export const getOrder = async (orderId: string): Promise<Order | null> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) {
      console.error("Error fetching order:", error);
      return null;
    }

    // Need to fetch order items separately
    const orderItems = await getOrderItems(orderId);
    
    // Convert the database order to our application order type
    const order: Order = {
      id: data.id,
      customerName: data.customer_name,
      customerImage: data.customer_image || "/placeholder.svg",
      items: orderItems,
      status: data.status,
      timestamp: data.timestamp,
      total: data.total,
      location: data.location || "",
      phone: data.phone || "",
      specialRequest: data.special_request || undefined,
      userId: data.user_id
    };

    return order;
  } catch (error) {
    console.error("Exception fetching order:", error);
    return null;
  }
};

export const getOrderItems = async (orderId: string): Promise<OrderItem[]> => {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (error) {
      console.error("Error fetching order items:", error);
      return [];
    }

    return data as OrderItem[];
  } catch (error) {
    console.error("Exception fetching order items:", error);
    return [];
  }
};

export const updateOrderStatus = async (
  orderId: string, 
  status: string,
  fromOrdersPage: boolean = false
) => {
  try {
    console.log(`Updating order ${orderId} status to ${status}, fromOrdersPage: ${fromOrdersPage}`);
    
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status, 
        from_orders_page: fromOrdersPage, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', orderId)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating order status:", error);
      return { success: false, error };
    }
    
    console.log(`Order ${orderId} status updated to ${status}`);
    
    // Broadcast the status change to connected clients
    try {
      const broadcastResult = await broadcastOrderStatusChange(orderId, status);
      console.log("Broadcast result:", broadcastResult);
    } catch (broadcastError) {
      console.error("Error broadcasting status change:", broadcastError);
    }
    
    return { success: true, data };
  } catch (error) {
    console.error("Exception in updateOrderStatus:", error);
    return { success: false, error };
  }
};

// Re-export broadcastOrderStatusChange from the Supabase client
import { broadcastOrderStatusChange } from "@/integrations/supabase/client";

