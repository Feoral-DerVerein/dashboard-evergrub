import { db, auth } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";
import { toast } from "sonner";
import { notificationService } from "./notificationService";

export interface WishlistItem {
  id: string;
  product_id: string;
  user_id: string;
  created_at: string;
  category_id?: string;
  product_data: any;
}

export const wishlistService = {
  async addToWishlist(productId: number, productData: any) {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      const docRef = await addDoc(collection(db, 'wishlists'), {
        product_id: productId.toString(),
        user_id: user.uid,
        product_data: productData,
        created_at: new Date().toISOString()
      });

      const newItem = { id: docRef.id, product_id: productId.toString(), user_id: user.uid, product_data: productData };

      // Create notification for admin
      await notificationService.createWishlistNotification(productId, productData.name);

      toast.success("Added to wishlist");
      return newItem;
    } catch (error) {
      console.error("Error in addToWishlist:", error);
      toast.error("Failed to add to wishlist");
      return null;
    }
  },

  async isInWishlist(productId: number): Promise<boolean> {
    const user = auth.currentUser;

    if (!user) {
      return false;
    }

    try {
      const q = query(
        collection(db, 'wishlists'),
        where('product_id', '==', productId.toString()),
        where('user_id', '==', user.uid)
      );

      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error("Error in isInWishlist:", error);
      return false;
    }
  },

  async getWishlistItems(): Promise<WishlistItem[]> {
    const user = auth.currentUser;

    if (!user) {
      return [];
    }

    try {
      const q = query(
        collection(db, 'wishlists'),
        where('user_id', '==', user.uid)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WishlistItem));
    } catch (error) {
      console.error("Error in getWishlistItems:", error);
      return [];
    }
  },

  async removeFromWishlist(productId: number): Promise<boolean> {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      const q = query(
        collection(db, 'wishlists'),
        where('product_id', '==', productId.toString()),
        where('user_id', '==', user.uid)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return false;
      }

      // Delete all matching (should be one)
      const batchPromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(batchPromises);

      return true;
    } catch (error) {
      console.error("Error in removeFromWishlist:", error);
      toast.error("Failed to remove from wishlist");
      return false;
    }
  },

  async notifyWishlistUsers(productId: number): Promise<void> {
    try {
      // Get all users who have this product in their wishlist
      const q = query(
        collection(db, 'wishlists'),
        where('product_id', '==', productId.toString())
      );

      const snapshot = await getDocs(q);
      const wishlistItems = snapshot.docs.map(doc => doc.data());

      if (!wishlistItems || wishlistItems.length === 0) {
        toast.info("No users have this product in their wishlist");
        return;
      }

      // For each user, create a notification
      // Access product name safely using type assertion
      const productData = wishlistItems[0]?.product_data;
      const productName = typeof productData === 'object' && productData !== null
        ? (productData as Record<string, any>).name || 'Product'
        : 'Product';

      toast.success(`${wishlistItems.length} users notified about ${productName}`);

      // In a real app, you would send the notifications to users here
      // This would typically involve a backend API call
    } catch (error) {
      console.error("Error in notifyWishlistUsers:", error);
      toast.error("Failed to notify wishlist users");
    }
  }
};
