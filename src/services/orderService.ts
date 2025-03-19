import { supabase } from "@/integrations/supabase/client";
import { Order, OrderItem, OrderStatus } from "@/types/order.types";
import { toast } from "@/components/ui/use-toast";

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
      toast({
        title: "Error creating order item.",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      return { success: false, error };
    }

    console.log("Order item created successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Exception creating order item:", error);
    toast({
      title: "Unexpected error.",
      description: "Please check the console for details.",
      variant: "destructive",
    });
    return { success: false, error };
  }
};

export const updateOrderItem = async (
  order_id: string,
  product_id: string,
  updates: Partial<UpdateOrderItemParams>
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
      toast({
        title: "Error updating order item.",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      return { success: false, error };
    }

    console.log("Order item updated successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Exception updating order item:", error);
    toast({
      title: "Unexpected error.",
      description: "Please check the console for details.",
      variant: "destructive",
    });
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
      toast({
        title: "Error deleting order item.",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      return { success: false, error };
    }

    console.log("Order item deleted successfully");
    return { success: true, data };
  } catch (error) {
    console.error("Exception deleting order item:", error);
    toast({
      title: "Unexpected error.",
      description: "Please check the console for details.",
      variant: "destructive",
    });
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

    return data as Order;
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
  status: OrderStatus,
  fromOrdersPage: boolean = false
) => {
  try {
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
    return { success: true, data };
  } catch (error) {
    console.error("Exception in updateOrderStatus:", error);
    return { success: false, error };
  }
};
