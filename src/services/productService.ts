import { Product, SAFFIRE_FREYCINET_STORE_ID } from "@/types/product.types";
import { productImageService } from "./productImageService";
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc
} from 'firebase/firestore';
import { AuditService } from "./auditService";
import { auth } from "@/lib/firebase";

export type { Product } from "@/types/product.types";
export { SAFFIRE_FREYCINET_STORE_ID } from "@/types/product.types";
export { productImageService } from "./productImageService";

export const productService = {
  // Helper to map doc
  _mapDoc(docSnap: any): Product {
    return { id: docSnap.id, ...docSnap.data() } as unknown as Product;
    // Note: Product.id in types is usually number, but Firestore is string. 
    // We might need to cast or update types types/product.types.ts 
    // For now, assuming Product interface tolerates string or we cast.
  },

  async getProductById(id: number | string): Promise<Product | null> {
    try {
      const docRef = doc(db, "products", String(id));
      // Use getDoc if we had the precise ID, but id might be number or string.
      // If we migrated numbered IDs to string IDs, direct getDoc works.
      // If not, we query. Assuming string IDs for Firestore.
      // But types say number. Let's assume we use auto-generated IDs (strings) from now on.
      // If 'id' is number (mock), we search by custom field 'legacyId' or restart.
      // For migration: We just start fresh with Firestore IDs.
      return null; // TODO: Implement specific ID fetch if needed
    } catch (e) { return null; }
  },

  async getProductsByUser(userId: string): Promise<Product[]> {
    try {
      const q = query(collection(db, "products"), where("userId", "==", userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(this._mapDoc);
    } catch (error) {
      console.error("Error fetching products", error);
      return [];
    }
  },

  async getAllProducts(): Promise<Product[]> {
    try {
      const q = query(collection(db, "products"), where("isMarketplaceVisible", "==", true));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(this._mapDoc);
    } catch (error) {
      return [];
    }
  },

  async getProductsByStore(storeId: string): Promise<Product[]> {
    try {
      // storeId matches userId in this context usually
      const q = query(collection(db, "products"), where("storeId", "==", storeId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(this._mapDoc);
    } catch (error) {
      return [];
    }
  },

  async createProduct(product: Product): Promise<Product> {
    try {
      // Ensure we associate with storeId/userId
      const dataToSave = { ...product };
      delete (dataToSave as any).id; // Let Firestore gen ID

      const docRef = await addDoc(collection(db, "products"), dataToSave);

      // Audit Log
      const user = auth.currentUser;
      if (user) {
        await AuditService.logProductChange(user.uid, user.email || '', docRef.id, null, dataToSave, 'CREATE');
      }

      return { id: docRef.id, ...dataToSave } as unknown as Product;
    } catch (error) {
      console.error("Error creating product", error);
      throw error;
    }
  },

  async updateProduct(id: number | string, updates: Partial<Product>): Promise<Product> {
    try {
      const docRef = doc(db, "products", String(id));

      // Audit Log (Need old value)
      const docSnap = await getDoc(docRef);
      const oldData = docSnap.exists() ? docSnap.data() : null;

      await updateDoc(docRef, updates);

      const user = auth.currentUser;
      if (user) {
        await AuditService.logProductChange(user.uid, user.email || '', String(id), oldData, updates, 'UPDATE');

        // Specialized stock change log
        if (oldData && updates.quantity !== undefined && updates.quantity !== oldData.quantity) {
          await AuditService.logStockChange(user.uid, user.email || '', String(id), oldData.quantity, updates.quantity);
        }
      }

      return { id, ...updates } as Product;
    } catch (error) {
      throw error;
    }
  },

  async deleteProduct(id: number | string): Promise<boolean> {
    try {
      const docRef = doc(db, "products", String(id));

      // Audit Log (Need old value)
      const docSnap = await getDoc(docRef);
      const oldData = docSnap.exists() ? docSnap.data() : null;

      await deleteDoc(docRef);

      const user = auth.currentUser;
      if (user && oldData) {
        await AuditService.logProductChange(user.uid, user.email || '', String(id), oldData, null, 'DELETE');
      }

      return true;
    } catch (error) {
      return false;
    }
  },

  uploadProductImage: productImageService.uploadImage
};
