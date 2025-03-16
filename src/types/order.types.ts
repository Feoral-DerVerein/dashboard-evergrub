
import { User } from "@supabase/supabase-js";

export interface OrderItem {
  id: string;
  order_id?: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  product_id?: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerImage: string;
  items: OrderItem[];
  status: "pending" | "accepted" | "completed";
  timestamp: string;
  total: number;
  location: string;
  phone: string;
  specialRequest?: string;
  userId?: string;
}

// Tipo para mapear entre la base de datos y la aplicación
export interface DbOrder {
  id: string;
  customer_name: string;
  customer_image: string;
  status: string;
  timestamp: string;
  total: number;
  location: string | null;
  phone: string | null;
  special_request: string | null;
  created_at: string;
  user_id: string | null;
}

export interface DbOrderItem {
  id: string;
  order_id: string;
  name: string;
  category: string | null;
  price: number;
  quantity: number;
  product_id: number | null;
}

// Mappers
export const mapDbOrderToOrder = (dbOrder: DbOrder, items: DbOrderItem[] = []): Order => {
  return {
    id: dbOrder.id,
    customerName: dbOrder.customer_name,
    customerImage: dbOrder.customer_image || "/placeholder.svg",
    items: items.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category || "",
      price: item.price,
      quantity: item.quantity
    })),
    status: dbOrder.status as "pending" | "accepted" | "completed",
    timestamp: new Date(dbOrder.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    total: dbOrder.total,
    location: dbOrder.location || "",
    phone: dbOrder.phone || "",
    specialRequest: dbOrder.special_request || undefined,
    userId: dbOrder.user_id || undefined
  };
};
