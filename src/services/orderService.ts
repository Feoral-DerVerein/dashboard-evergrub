import { supabase, broadcastOrderStatusChange } from "@/integrations/supabase/client";
import { 
  Order, 
  DbOrder, 
  OrderItem, 
  DbOrderItem, 
  mapDbOrderToOrder 
} from "@/types/order.types";
import { notificationService } from "@/services/notificationService";
import { toast } from "sonner";

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
      
      // Verificar primero si la orden existe
      const { data: existingOrder, error: checkError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      
      if (checkError) {
        console.error(`Error al verificar si existe la orden ${orderId}:`, checkError);
        throw new Error(`No se pudo encontrar la orden con ID ${orderId}: ${checkError.message}`);
      }
      
      if (!existingOrder) {
        console.error(`La orden con ID ${orderId} no existe`);
        throw new Error(`La orden con ID ${orderId} no existe`);
      }
      
      // Actualizar el estado de la orden sin usar select() para evitar problemas de RLS
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
      
      if (updateError) {
        console.error(`Error al actualizar el estado de la orden ${orderId}:`, updateError);
        throw new Error(`Error al actualizar el estado: ${updateError.message}`);
      }
      
      // Obtener la orden actualizada después de la actualización
      const { data: refreshedOrder, error: refreshError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
          
      if (refreshError) {
        console.error(`Error al recargar la orden ${orderId}:`, refreshError);
        throw new Error(`No se pudo obtener la orden actualizada: ${refreshError.message}`);
      }
        
      // Usar la orden recargada
      console.log(`Orden ${orderId} actualizada correctamente a ${refreshedOrder?.status}`);

      // Broadcast the event to all subscribers to order status changes
      try {
        // Use the helper function instead of direct RPC call
        const broadcast = await broadcastOrderStatusChange(orderId, status);
        console.log('Broadcast result:', broadcast);
      } catch (broadcastError) {
        console.error('Failed to broadcast status change:', broadcastError);
        // Continue since the status was updated, broadcast is just an optimization
      }
      
      // Create a notification when an order is accepted
      if (status === "accepted") {
        try {
          await notificationService.createOrderNotification(
            orderId, 
            `La orden #${orderId.substring(0, 8)} ha sido aceptada`
          );
          console.log(`Notificación de aceptación creada para la orden ${orderId}`);
        } catch (notifError) {
          console.error(`Error al crear la notificación para la orden ${orderId}:`, notifError);
          // Continuamos aunque falle la notificación, ya que el estado se actualizó correctamente
        }
      }
        
      // Create notifications when an order is completed
      if (status === "completed") {
        try {
          // Status update notification
          await notificationService.createOrderNotification(
            orderId, 
            `La orden #${orderId.substring(0, 8)} ha sido completada`
          );
          console.log(`Notificación de completado creada para la orden ${orderId}`);
            
          // Create a pickup notification for marketplace orders
          await notificationService.createPickupNotification(orderId);
          console.log(`Notificación de retiro creada para la orden ${orderId}`);
          
          // Create a sales notification for the sales dashboard
          if (refreshedOrder) {
            await notificationService.createSalesNotification(orderId, refreshedOrder.total);
            console.log(`Notificación de ventas creada para la orden ${orderId}`);
            
            // Show a toast notification on the current screen
            toast.success(`Venta registrada: $${refreshedOrder.total.toFixed(2)}`, {
              description: `La orden #${orderId.substring(0, 8)} ha sido completada y registrada como venta.`
            });
          }
        } catch (notifError) {
          console.error(`Error al crear las notificaciones para la orden ${orderId}:`, notifError);
          // Continuamos aunque falle la notificación, ya que el estado se actualizó correctamente
        }
      }
        
      // Obtener los items de la orden actualizada
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);
        
      if (itemsError) {
        console.error(`Error al obtener los items después de actualizar la orden ${orderId}:`, itemsError);
        throw new Error(`Error al obtener los items: ${itemsError.message}`);
      }
        
      return mapDbOrderToOrder(refreshedOrder as DbOrder, itemsData as DbOrderItem[]);
    } catch (error) {
      console.error(`Error en updateOrderStatus para la orden ${orderId}:`, error);
      throw error;
    }
  },
  
  // Eliminar una orden y sus items
  async deleteOrder(orderId: string): Promise<void> {
    try {
      console.log(`Eliminando orden con ID: ${orderId}`);
      
      // Primero verificamos si la orden existe
      const { data: existingOrder, error: checkError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      
      if (checkError) {
        console.error(`Error al verificar si existe la orden ${orderId}:`, checkError);
        throw new Error(`No se pudo encontrar la orden con ID ${orderId}: ${checkError.message}`);
      }
      
      if (!existingOrder) {
        console.error(`La orden con ID ${orderId} no existe`);
        throw new Error(`La orden con ID ${orderId} no existe`);
      }
      
      // Eliminar primero los items de la orden (debido a la restricción de clave foránea)
      const { error: deleteItemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);
      
      if (deleteItemsError) {
        console.error(`Error al eliminar los items de la orden ${orderId}:`, deleteItemsError);
        throw new Error(`Error al eliminar los items de la orden: ${deleteItemsError.message}`);
      }
      
      // Eliminar la orden
      const { error: deleteOrderError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);
      
      if (deleteOrderError) {
        console.error(`Error al eliminar la orden ${orderId}:`, deleteOrderError);
        throw new Error(`Error al eliminar la orden: ${deleteOrderError.message}`);
      }
      
      console.log(`Orden ${orderId} eliminada correctamente`);
    } catch (error) {
      console.error(`Error en deleteOrder para la orden ${orderId}:`, error);
      throw error;
    }
  },

  // Delete all orders and their items
  async deleteAllOrders(): Promise<void> {
    try {
      console.log('Deleting all orders and their items');

      // First delete all order items (due to foreign key constraints)
      const { error: deleteItemsError } = await supabase
        .from('order_items')
        .delete()
        .neq('order_id', null); // Delete all items related to orders
      
      if (deleteItemsError) {
        console.error('Error deleting all order items:', deleteItemsError);
        throw new Error(`Error deleting order items: ${deleteItemsError.message}`);
      }
      
      // Then delete all orders
      const { error: deleteOrdersError } = await supabase
        .from('orders')
        .delete()
        .neq('id', null); // Delete all orders
      
      if (deleteOrdersError) {
        console.error('Error deleting all orders:', deleteOrdersError);
        throw new Error(`Error deleting orders: ${deleteOrdersError.message}`);
      }
      
      console.log('All orders and items deleted successfully');
    } catch (error) {
      console.error('Error in deleteAllOrders:', error);
      throw error;
    }
  }
};
