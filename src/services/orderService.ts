import { Order, OrderItem, mapDbOrderToOrder, DbOrder, DbOrderItem } from "@/types/order.types";
import { toast } from "sonner";

// Mock Data Store Keys
const STORAGE_KEY_ORDERS = 'mock_orders';
const STORAGE_KEY_ORDER_ITEMS = 'mock_order_items';

// Helper to get mock data
const getMockOrders = (): any[] => {
  const stored = localStorage.getItem(STORAGE_KEY_ORDERS);
  return stored ? JSON.parse(stored) : [];
};
const getMockOrderItems = (): any[] => {
  const stored = localStorage.getItem(STORAGE_KEY_ORDER_ITEMS);
  return stored ? JSON.parse(stored) : [];
};

// Seed initial data if empty
const seedOrders = () => {
  if (!localStorage.getItem(STORAGE_KEY_ORDERS)) {
    const initialOrders = [
      { id: 'ord-1', user_id: 'user-1', status: 'pending', total: 45.00, customer_name: 'John Doe', timestamp: new Date().toISOString() },
      { id: 'ord-2', user_id: 'user-1', status: 'completed', total: 12.50, customer_name: 'Jane Smith', timestamp: new Date(Date.now() - 86400000).toISOString() }
    ];
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(initialOrders));

    const initialItems = [
      { id: 'item-1', order_id: 'ord-1', product_id: 1, quantity: 2, price: 5.00, name: 'Latte' },
      { id: 'item-2', order_id: 'ord-1', product_id: 2, quantity: 1, price: 3.50, name: 'Croissant' }
    ];
    localStorage.setItem(STORAGE_KEY_ORDER_ITEMS, JSON.stringify(initialItems));
  }
};
seedOrders(); // Run seed

export const createOrderItem = async (orderItem: OrderItem) => {
  const items = getMockOrderItems();
  const newItem = { ...orderItem, id: `item-${Date.now()}` };
  items.push(newItem);
  localStorage.setItem(STORAGE_KEY_ORDER_ITEMS, JSON.stringify(items));
  return { success: true, data: [newItem] };
};

export const updateOrderItem = async (
  order_id: string,
  product_id: string | number,
  updates: any
) => {
  const items = getMockOrderItems();
  const index = items.findIndex((i: any) => i.order_id === order_id && i.product_id == product_id);
  if (index === -1) return { success: false, error: "Item not found" };

  items[index] = { ...items[index], ...updates };
  localStorage.setItem(STORAGE_KEY_ORDER_ITEMS, JSON.stringify(items));
  return { success: true, data: [items[index]] };
};

export const deleteOrderItem = async (order_id: string, product_id: string | number) => {
  let items = getMockOrderItems();
  items = items.filter((i: any) => !(i.order_id === order_id && i.product_id == product_id));
  localStorage.setItem(STORAGE_KEY_ORDER_ITEMS, JSON.stringify(items));
  return { success: true };
};

export const getOrder = async (orderId: string): Promise<Order | null> => {
  const orders = getMockOrders();
  const orderData = orders.find((o: any) => o.id === orderId);
  if (!orderData) return null;

  const items = await getOrderItems(orderId);

  return {
    id: orderData.id,
    customerName: orderData.customer_name,
    customerImage: orderData.customer_image || "/placeholder.svg",
    items: items,
    status: orderData.status as "pending" | "accepted" | "completed" | "rejected",
    timestamp: orderData.timestamp,
    total: orderData.total,
    location: orderData.location || "",
    phone: orderData.phone || "",
    specialRequest: orderData.special_request || undefined,
    userId: orderData.user_id
  };
};

export const getUserOrders = async (): Promise<Order[]> => {
  const ordersData = getMockOrders();
  // In a real app we'd filter by user_id but for mock we return all

  return Promise.all(ordersData.map(async (order: any) => {
    const items = await getOrderItems(order.id);
    return {
      id: order.id,
      customerName: order.customer_name,
      customerImage: "/placeholder.svg",
      items: items,
      status: order.status,
      timestamp: order.timestamp,
      total: order.total,
      location: order.location || "",
      phone: order.phone || "",
      userId: order.user_id
    };
  }));
};

export const getOrderItems = async (orderId: string): Promise<OrderItem[]> => {
  const items = getMockOrderItems();
  return items.filter((i: any) => i.order_id === orderId);
};

export const updateOrderStatus = async (
  orderId: string,
  status: "pending" | "accepted" | "completed" | "rejected",
  fromOrdersPage: boolean = false
) => {
  const orders = getMockOrders();
  const index = orders.findIndex((o: any) => o.id === orderId);
  if (index === -1) return { success: false, error: "Order not found" };

  orders[index].status = status;
  orders[index].updated_at = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));

  console.log(`Order ${orderId} status updated to ${status}`);
  return { success: true, data: [orders[index]] };
};

export const getCompletedOrders = async (): Promise<Order[]> => {
  const allOrders = await getUserOrders();
  return allOrders.filter(o => o.status === 'completed');
};
