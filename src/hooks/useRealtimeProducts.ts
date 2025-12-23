import { useEffect, useState } from 'react';
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  DocumentData
} from "firebase/firestore";
import { Product } from '@/services/productService'; // Assuming type is compatible or I'll redefine partial
import { useToast } from '@/hooks/use-toast';

export const useRealtimeProducts = (userId?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    console.log("Setting up Firestore realtime subscription for products, userId:", userId);
    setLoading(true);

    const q = query(
      collection(db, "products"),
      where("tenant_id", "==", userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const currentProducts: Product[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        // Map Firestore data to Product interface
        // Ensuring all fields match what frontend expects
        currentProducts.push({
          id: doc.id,
          name: data.name,
          category: data.category,
          price: data.price,
          quantity: data.quantity,
          unit: data.unit || 'units',
          image: data.image,
          expiryDate: data.expiration_date, // Mapping expiration_date -> expiryDate
          expirationDate: data.expiration_date,
          status: data.status,
          minStockLevel: data.min_stock_level,
          shelfLife: data.shelf_life,
          batchNumber: data.batch_number,
          supplier: data.supplier,
          notes: data.notes,

          // Legacy/Other potential fields
          description: data.description,
          discount: data.discount,
          brand: data.brand,
          storeId: data.store_id, // Mapping store_id -> storeId
          userId: data.tenant_id, // Mapping tenant_id -> userId
          barcode: data.barcode,
          isMarketplaceVisible: data.is_marketplace_visible,
          isSurpriseBag: data.is_surprise_bag,
          originalPrice: data.original_price,
          pickupTimeStart: data.pickup_time_start,
          pickupTimeEnd: data.pickup_time_end,
          surpriseBagContents: data.surprise_bag_contents ? [data.surprise_bag_contents] : undefined
        } as unknown as Product);
      });

      setProducts(currentProducts);
      setLoading(false);

      snapshot.docChanges().forEach((change) => {
        if (change.type === "modified") {
          // Toast for updates
          const data = change.doc.data();
          // Optional: don't toast on initial load, only subsequent updates
          // But onSnapshot fires initial with "added" usually. "modified" is strictly updates.
          toast({
            title: "Product Updated",
            description: `${data.name} has been updated`,
          });
        }
      });
    }, (err) => {
      console.error("Firestore subscription error:", err);
      setError(err.message);
      setLoading(false);
    });

    return () => {
      console.log("Cleaning up Firestore subscription");
      unsubscribe();
    };
  }, [userId, toast]);

  const refreshProducts = async () => {
    // No-op for realtime, but kept for interface compatibility
    // Could potentially re-run query if needed manually
  };

  return {
    products,
    loading,
    error,
    refreshProducts,
    setProducts
  };
};