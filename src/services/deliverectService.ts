import { supabase } from "@/integrations/supabase/client";

export interface DeliverectConnection {
  id: string;
  user_id: string;
  api_key: string;
  location_id: string;
  account_id?: string;
  connection_status: string;
  webhook_url?: string;
  auto_sync_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeliverectShipment {
  id?: string;
  user_id: string;
  connection_id: string;
  products: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
    category: string;
  }>;
  total_items: number;
  status: 'pending' | 'processing' | 'sent' | 'failed';
  deliverect_order_id?: string;
  platform?: string;
  error_message?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DeliverectOrder {
  id?: string;
  user_id: string;
  deliverect_order_id: string;
  shipment_id?: string;
  customer_name?: string;
  customer_phone?: string;
  delivery_address?: string;
  order_status: string;
  platform: string;
  total_amount?: number;
  items: any[];
  estimated_delivery_time?: string;
  actual_delivery_time?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DeliverectDelivery {
  id?: string;
  user_id: string;
  order_id: string;
  courier_name?: string;
  courier_phone?: string;
  courier_location?: any;
  dispatch_status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered';
  assigned_at?: string;
  picked_up_at?: string;
  delivered_at?: string;
  tracking_url?: string;
  created_at?: string;
  updated_at?: string;
}

const deliverectService = {
  // ===== Connection Management =====
  async getConnection(): Promise<DeliverectConnection | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('deliverect_connections')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async saveConnection(connection: Omit<DeliverectConnection, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<DeliverectConnection> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('deliverect_connections')
      .upsert({
        user_id: user.id,
        ...connection,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateConnection(updates: Partial<DeliverectConnection>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('deliverect_connections')
      .update(updates)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  async deleteConnection(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('deliverect_connections')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;
  },

  // ===== Shipment Management =====
  async createShipment(shipment: Omit<DeliverectShipment, 'id' | 'user_id'>): Promise<DeliverectShipment> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('deliverect_shipments')
      .insert({
        user_id: user.id,
        ...shipment,
      })
      .select()
      .single();

    if (error) throw error;
    return data as DeliverectShipment;
  },

  async getShipments(): Promise<DeliverectShipment[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('deliverect_shipments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as DeliverectShipment[];
  },

  async updateShipmentStatus(shipmentId: string, status: string, errorMessage?: string): Promise<void> {
    const { error } = await supabase
      .from('deliverect_shipments')
      .update({ 
        status,
        error_message: errorMessage,
        updated_at: new Date().toISOString()
      })
      .eq('id', shipmentId);

    if (error) throw error;
  },

  // ===== Order Management =====
  async createOrder(order: Omit<DeliverectOrder, 'id' | 'user_id'>): Promise<DeliverectOrder> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('deliverect_orders')
      .insert({
        user_id: user.id,
        ...order,
      })
      .select()
      .single();

    if (error) throw error;
    return data as DeliverectOrder;
  },

  async getOrders(): Promise<DeliverectOrder[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('deliverect_orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as DeliverectOrder[];
  },

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('deliverect_orders')
      .update({ 
        order_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) throw error;
  },

  // ===== Delivery/Dispatch Management =====
  async createDelivery(delivery: Omit<DeliverectDelivery, 'id' | 'user_id'>): Promise<DeliverectDelivery> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('deliverect_deliveries')
      .insert({
        user_id: user.id,
        ...delivery,
      })
      .select()
      .single();

    if (error) throw error;
    return data as DeliverectDelivery;
  },

  async getDeliveries(): Promise<DeliverectDelivery[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('deliverect_deliveries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as DeliverectDelivery[];
  },

  async updateDeliveryStatus(deliveryId: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('deliverect_deliveries')
      .update({ 
        dispatch_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', deliveryId);

    if (error) throw error;
  },

  async assignCourier(deliveryId: string, courierName: string, courierPhone: string): Promise<void> {
    const { error } = await supabase
      .from('deliverect_deliveries')
      .update({ 
        courier_name: courierName,
        courier_phone: courierPhone,
        dispatch_status: 'assigned',
        assigned_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', deliveryId);

    if (error) throw error;
  },

  // ===== API Integration =====
  async sendToDeliverect(shipmentId: string): Promise<void> {
    const { data, error } = await supabase.functions.invoke('send-to-deliverect', {
      body: { shipmentId }
    });

    if (error) throw error;
    return data;
  },

  async testConnection(apiKey: string, locationId: string): Promise<boolean> {
    try {
      // Test API connection
      const response = await fetch(`https://api.deliverect.com/api/v1/locations/${locationId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
};

export default deliverectService;
