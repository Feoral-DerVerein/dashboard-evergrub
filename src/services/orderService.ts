import { supabase } from "@/integrations/supabase/client";
import { 
  Order, 
  DbOrder, 
  OrderItem, 
  DbOrderItem, 
  mapDbOrderToOrder 
} from "@/types/order.types";
import { notificationService } from "@/services/notificationService";

export const orderService = {
  // Obtener todas las órdenes del usuario actual y las de marketplace
  async getUserOrders(): Promise<Order[]> {
    try {
      // Obtener el usuario actual desde la sesión
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Error al obtener la sesión:", sessionError);
        throw sessionError;
      }
      
      const userId = sessionData?.session?.user?.id;
      
      if (!userId) {
        console.log("No hay usuario autenticado");
        return [];
      }
      
      console.log("Obteniendo órdenes del usuario:", userId);
      
      // Debugging: fetch all orders to see if any exist in the system
      const { data: allOrders, error: allOrdersError } = await supabase
        .from('orders')
        .select('*')
        .order('timestamp', { ascending: false });
        
      if (allOrdersError) {
        console.error("Error al verificar todas las órdenes:", allOrdersError);
      } else {
        console.log("Total de órdenes en el sistema:", allOrders?.length || 0);
        if (allOrders && allOrders.length > 0) {
          console.log("Ejemplo de orden:", allOrders[0]);
        }
      }
      
      // Fetch orders for the current user OR orders with no user_id (marketplace)
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .or(`user_id.eq.${userId},user_id.is.null`)
        .order('timestamp', { ascending: false });
      
      if (ordersError) {
        console.error("Error al obtener órdenes:", ordersError);
        throw ordersError;
      }
      
      if (!ordersData || ordersData.length === 0) {
        console.log("No se encontraron órdenes para el usuario o del marketplace");
        return [];
      }
      
      console.log("Órdenes encontradas:", ordersData.length);
      
      const orders: Order[] = [];
      
      // Para cada orden, obtener sus items
      for (const dbOrder of ordersData as DbOrder[]) {
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', dbOrder.id);
        
        if (itemsError) {
          console.error(`Error al obtener items para la orden ${dbOrder.id}:`, itemsError);
          continue;
        }
        
        orders.push(mapDbOrderToOrder(dbOrder, itemsData as DbOrderItem[]));
      }
      
      console.log("Órdenes procesadas:", orders.length);
      return orders;
    } catch (error) {
      console.error("Error en getUserOrders:", error);
      throw error;
    }
  },
  
  // Obtener una orden por ID
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      console.log(`Obteniendo orden con ID: ${orderId}`);
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      
      if (orderError) {
        console.error("Error al obtener la orden:", orderError);
        throw orderError;
      }
      
      if (!orderData) {
        console.log(`No se encontró la orden con ID: ${orderId}`);
        return null;
      }
      
      // Obtener los items de la orden
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);
      
      if (itemsError) {
        console.error("Error al obtener los items de la orden:", itemsError);
        throw itemsError;
      }
      
      return mapDbOrderToOrder(orderData as DbOrder, itemsData as DbOrderItem[]);
    } catch (error) {
      console.error("Error en getOrderById:", error);
      throw error;
    }
  },
  
  // Crear una nueva orden
  async createOrder(order: Omit<Order, "id">, userId: string): Promise<Order> {
    try {
      console.log("Creando nueva orden:", order);
      
      // Primero crear la orden
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name: order.customerName,
          customer_image: order.customerImage,
          status: order.status,
          timestamp: new Date().toISOString(),
          total: order.total,
          location: order.location,
          phone: order.phone,
          special_request: order.specialRequest,
          user_id: userId
        }])
        .select()
        .single();
      
      if (orderError) {
        console.error("Error al crear la orden:", orderError);
        throw orderError;
      }
      
      const newOrderId = orderData.id;
      
      // Luego crear los items de la orden
      const orderItems = order.items.map(item => ({
        order_id: newOrderId,
        name: item.name,
        category: item.category,
        price: item.price,
        quantity: item.quantity,
        product_id: item.product_id
      }));
      
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)
        .select();
      
      if (itemsError) {
        console.error("Error al crear los items de la orden:", itemsError);
        // Intentar eliminar la orden para mantener consistencia
        await supabase.from('orders').delete().eq('id', newOrderId);
        throw itemsError;
      }
      
      return mapDbOrderToOrder(orderData as DbOrder, itemsData as DbOrderItem[]);
    } catch (error) {
      console.error("Error en createOrder:", error);
      throw error;
    }
  },
  
  // Actualizar el estado de una orden
  async updateOrderStatus(orderId: string, status: "pending" | "accepted" | "completed" | "rejected"): Promise<Order> {
    try {
      console.log(`Actualizando estado de la orden ${orderId} a ${status}`);
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();
      
      if (orderError) {
        console.error("Error al actualizar el estado de la orden:", orderError);
        throw orderError;
      }
      
      // Create a notification when an order is accepted
      if (status === "accepted") {
        await notificationService.createOrderNotification(orderId, `Order #${orderId.substring(0, 8)} has been accepted`);
      }
      
      // Obtener los items de la orden actualizada
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);
      
      if (itemsError) {
        console.error("Error al obtener los items después de actualizar:", itemsError);
        throw itemsError;
      }
      
      return mapDbOrderToOrder(orderData as DbOrder, itemsData as DbOrderItem[]);
    } catch (error) {
      console.error("Error en updateOrderStatus:", error);
      throw error;
    }
  }
};
