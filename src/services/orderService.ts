
import { supabase } from "@/integrations/supabase/client";
import { Order, OrderItem, mapDbOrderToOrder, DbOrder, DbOrderItem } from "@/types/order.types";
import { toast } from "sonner";

interface UpdateOrderItemParams {
  order_id: string;
  product_id: string | number; // Updated to accept both string and number
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
  product_id: string | number, // Updated to accept both string and number
  updates: Partial<Omit<UpdateOrderItemParams, 'product_id'>>
) => {
  try {
    // Convert product_id to number if it's a string and contains only digits
    const productIdValue = typeof product_id === 'string' && /^\d+$/.test(product_id) 
      ? parseInt(product_id, 10) 
      : product_id;
      
    const { data, error } = await supabase
      .from('order_items')
      .update(updates)
      .eq('order_id', order_id)
      .eq('product_id', productIdValue as number) // Force type assertion here
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

export const deleteOrderItem = async (order_id: string, product_id: string | number) => {
  try {
    // Convert product_id to number if it's a string and contains only digits
    const productIdValue = typeof product_id === 'string' && /^\d+$/.test(product_id) 
      ? parseInt(product_id, 10) 
      : product_id;
    
    const { data, error } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', order_id)
      .eq('product_id', productIdValue as number) // Force type assertion here
      .select();

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
      status: data.status as "pending" | "accepted" | "completed" | "rejected",
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

export const getUserOrders = async (): Promise<Order[]> => {
  try {
    // Get all orders (you might want to filter by user_id if needed)
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (ordersError) {
      console.error("Error fetching orders:", ordersError);
      return [];
    }
    
    if (!ordersData || ordersData.length === 0) {
      return [];
    }

    // Get all order items for these orders
    const orderIds = ordersData.map((order: DbOrder) => order.id);
    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .in('order_id', orderIds);
    
    if (itemsError) {
      console.error("Error fetching order items:", itemsError);
      return [];
    }

    // Map DB orders to app orders
    const orders: Order[] = ordersData.map((dbOrder: DbOrder) => {
      // Find items for this order
      const orderItems = (itemsData || []).filter(
        (item: DbOrderItem) => item.order_id === dbOrder.id
      );
      
      return mapDbOrderToOrder(dbOrder, orderItems);
    });

    return orders;
  } catch (error) {
    console.error("Exception in getUserOrders:", error);
    return [];
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
  status: "pending" | "accepted" | "completed" | "rejected",
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
    
    // If the status is completed, the database trigger will automatically create a sales record
    if (status === 'completed') {
      console.log("Order completed, sales record will be created by database trigger");
    }
    
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

// Get completed orders (sales)
export const getCompletedOrders = async (): Promise<Order[]> => {
  try {
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'completed')
      .order('updated_at', { ascending: false });
    
    if (ordersError) {
      console.error("Error fetching completed orders:", ordersError);
      return [];
    }
    
    if (!ordersData || ordersData.length === 0) {
      return [];
    }

    // Get all order items for these orders
    const orderIds = ordersData.map((order: DbOrder) => order.id);
    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .in('order_id', orderIds);
    
    if (itemsError) {
      console.error("Error fetching order items for completed orders:", itemsError);
      return [];
    }

    // Map DB orders to app orders
    const orders: Order[] = ordersData.map((dbOrder: DbOrder) => {
      // Find items for this order
      const orderItems = (itemsData || []).filter(
        (item: DbOrderItem) => item.order_id === dbOrder.id
      );
      
      return mapDbOrderToOrder(dbOrder, orderItems);
    });

    return orders;
  } catch (error) {
    console.error("Exception in getCompletedOrders:", error);
    return [];
  }
};

// Re-export broadcastOrderStatusChange from the Supabase client
import { broadcastOrderStatusChange } from "@/integrations/supabase/client";
