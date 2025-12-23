import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  limit
} from "firebase/firestore";

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
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const q = query(collection(db, 'deliverect_connections'), where('user_id', '==', user.uid), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as DeliverectConnection;
  },

  async saveConnection(connection: Omit<DeliverectConnection, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<DeliverectConnection> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    // Check if exists
    const q = query(collection(db, 'deliverect_connections'), where('user_id', '==', user.uid), limit(1));
    const snapshot = await getDocs(q);

    const data = {
      user_id: user.uid,
      ...connection,
      updated_at: new Date().toISOString()
    };

    if (!snapshot.empty) {
      // Update
      const docRef = snapshot.docs[0].ref;
      await updateDoc(docRef, data);
      return { id: docRef.id, ...snapshot.docs[0].data(), ...data } as DeliverectConnection;
    } else {
      // Create
      const newData = { ...data, created_at: new Date().toISOString() };
      const docRef = await addDoc(collection(db, 'deliverect_connections'), newData);
      return { id: docRef.id, ...newData } as DeliverectConnection;
    }
  },

  async updateConnection(updates: Partial<DeliverectConnection>): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const q = query(collection(db, 'deliverect_connections'), where('user_id', '==', user.uid), limit(1));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      await updateDoc(snapshot.docs[0].ref, {
        ...updates,
        updated_at: new Date().toISOString()
      });
    }
  },

  async deleteConnection(): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const q = query(collection(db, 'deliverect_connections'), where('user_id', '==', user.uid), limit(1));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      await deleteDoc(snapshot.docs[0].ref);
    }
  },

  // ===== Shipment Management =====
  async createShipment(shipment: Omit<DeliverectShipment, 'id' | 'user_id'>): Promise<DeliverectShipment> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const data = {
      user_id: user.uid,
      ...shipment,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'deliverect_shipments'), data);
    return { id: docRef.id, ...data } as DeliverectShipment;
  },

  async getShipments(): Promise<DeliverectShipment[]> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const q = query(collection(db, 'deliverect_shipments'), where('user_id', '==', user.uid), orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as DeliverectShipment));
  },

  async updateShipmentStatus(shipmentId: string, status: string, errorMessage?: string): Promise<void> {
    const docRef = doc(db, 'deliverect_shipments', shipmentId);
    await updateDoc(docRef, {
      status,
      error_message: errorMessage,
      updated_at: new Date().toISOString()
    });
  },

  // ===== Order Management =====
  async createOrder(order: Omit<DeliverectOrder, 'id' | 'user_id'>): Promise<DeliverectOrder> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const data = {
      user_id: user.uid,
      ...order,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, 'deliverect_orders'), data);
    return { id: docRef.id, ...data } as DeliverectOrder;
  },

  async getOrders(): Promise<DeliverectOrder[]> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const q = query(collection(db, 'deliverect_orders'), where('user_id', '==', user.uid), orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as DeliverectOrder));
  },

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    const docRef = doc(db, 'deliverect_orders', orderId);
    await updateDoc(docRef, {
      order_status: status,
      updated_at: new Date().toISOString()
    });
  },

  // ===== Delivery/Dispatch Management =====
  async createDelivery(delivery: Omit<DeliverectDelivery, 'id' | 'user_id'>): Promise<DeliverectDelivery> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const data = {
      user_id: user.uid,
      ...delivery,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, 'deliverect_deliveries'), data);
    return { id: docRef.id, ...data } as DeliverectDelivery;
  },

  async getDeliveries(): Promise<DeliverectDelivery[]> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const q = query(collection(db, 'deliverect_deliveries'), where('user_id', '==', user.uid), orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as DeliverectDelivery));
  },

  async updateDeliveryStatus(deliveryId: string, status: string): Promise<void> {
    const docRef = doc(db, 'deliverect_deliveries', deliveryId);
    await updateDoc(docRef, {
      dispatch_status: status,
      updated_at: new Date().toISOString()
    });
  },

  async assignCourier(deliveryId: string, courierName: string, courierPhone: string): Promise<void> {
    const docRef = doc(db, 'deliverect_deliveries', deliveryId);
    await updateDoc(docRef, {
      courier_name: courierName,
      courier_phone: courierPhone,
      dispatch_status: 'assigned',
      assigned_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  },

  // ===== API Integration =====
  async sendToDeliverect(shipmentId: string): Promise<void> {
    // Feature pending migration to Firebase Functions
    // const { data, error } = await firebase_functions.invoke('send-to-deliverect', { ... });
    console.log("Deliverect integration mocked (pending Cloud Functions)");
    return;
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
