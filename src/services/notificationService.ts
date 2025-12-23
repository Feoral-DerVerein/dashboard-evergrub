import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  updateDoc,
  doc
} from "firebase/firestore";

export interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  is_read: boolean;
  type: string;
  order_id?: string;
  for_marketplace?: boolean;
  product_id?: string;
  product_image?: string;
  product_price?: string;
  customer_name?: string;
  user_id?: string;
}

export const notificationService = {
  async getAllNotifications(): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, 'notifications'),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
    } catch (error) {
      console.error("Error in getAllNotifications:", error);
      return [];
    }
  },

  async markAsRead(notificationId: string): Promise<void> {
    try {
      const docRef = doc(db, 'notifications', notificationId);
      await updateDoc(docRef, { is_read: true });
    } catch (error) {
      console.error("Error in markAsRead:", error);
      throw error;
    }
  },

  async createOrderNotification(orderId: string, title: string, description: string): Promise<void> {
    try {
      await addDoc(collection(db, 'notifications'), {
        title,
        description,
        order_id: orderId,
        type: 'order',
        timestamp: new Date().toISOString(),
        is_read: false
      });
    } catch (error) {
      console.error("Error in createOrderNotification:", error);
    }
  },

  async createWishlistNotification(productId: number, productName: string, productImage?: string, productPrice?: string, customerName?: string): Promise<void> {
    try {
      await addDoc(collection(db, 'notifications'), {
        title: `New wishlist item: ${productName}`,
        description: `Someone added ${productName} to their wishlist`,
        type: 'wishlist',
        product_id: productId.toString(),
        product_image: productImage,
        product_price: productPrice,
        customer_name: customerName || 'Anonymous Customer',
        timestamp: new Date().toISOString(),
        is_read: false
      });
    } catch (error) {
      console.error("Error in createWishlistNotification:", error);
    }
  },

  async createSalesNotification(orderId: string, amount: number): Promise<void> {
    try {
      await addDoc(collection(db, 'notifications'), {
        title: `New sale recorded`,
        description: `A sale for $${amount.toFixed(2)} has been completed`,
        order_id: orderId,
        type: 'sales',
        timestamp: new Date().toISOString(),
        is_read: false
      });
    } catch (error) {
      console.error("Error in createSalesNotification:", error);
    }
  },

  async createPurchaseRequestNotification(productId: string, productName: string, buyerName: string, quantity: number, offerPrice?: number): Promise<void> {
    try {
      const title = offerPrice
        ? `New offer for ${productName}`
        : `Someone wants to buy ${productName}`;

      const description = offerPrice
        ? `${buyerName} made an offer of $${offerPrice} for ${quantity} units`
        : `${buyerName} is interested in buying ${quantity} units`;

      await addDoc(collection(db, 'notifications'), {
        title,
        description,
        product_id: productId,
        customer_name: buyerName,
        type: 'purchase',
        timestamp: new Date().toISOString(),
        is_read: false
      });
    } catch (error) {
      console.error("Error in createPurchaseRequestNotification:", error);
    }
  },

  async createSampleProductNotifications(): Promise<void> {
    const sampleProducts = [
      {
        id: 1001,
        name: "Organic Fresh Avocado",
        price: "3.99",
        image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=400&auto=format",
        description: "Locally sourced fresh avocados",
        customer: "Maria Rodriguez"
      },
      {
        id: 1002,
        name: "Premium Coffee Beans",
        price: "12.50",
        image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=400&auto=format",
        description: "Premium roasted coffee beans, direct from Colombia",
        customer: "James Wilson"
      },
      {
        id: 1003,
        name: "Whole Grain Bread",
        price: "4.25",
        image: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?q=80&w=400&auto=format",
        description: "Freshly baked artisan whole grain bread",
        customer: "Sarah Johnson"
      },
      {
        id: 1004,
        name: "Organic Strawberries",
        price: "5.99",
        image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=400&auto=format",
        description: "Sweet organic strawberries, perfect for desserts",
        customer: "Michael Thompson"
      },
      {
        id: 1005,
        name: "Free Range Eggs (12-pack)",
        price: "6.49",
        image: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?q=80&w=400&auto=format",
        description: "Farm fresh free-range eggs, sustainably produced",
        customer: "Emily Parker"
      }
    ];

    try {
      for (const product of sampleProducts) {
        await this.createWishlistNotification(
          product.id,
          product.name,
          product.image,
          product.price,
          product.customer
        );
        console.log(`Created notification for product: ${product.name}`);
      }

      console.log("Sample product notifications created successfully");
    } catch (error) {
      console.error("Error creating sample product notifications:", error);
    }
  }
};
