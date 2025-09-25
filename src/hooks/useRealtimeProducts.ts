import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { productService, Product } from '@/services/productService';
import { useToast } from '@/hooks/use-toast';

export const useRealtimeProducts = (userId?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load initial products
  useEffect(() => {
    const loadProducts = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        console.log("Loading products for user:", userId);
        const userProducts = await productService.getProductsByUser(userId);
        console.log("Loaded products:", userProducts.length);
        setProducts(userProducts);
      } catch (error: any) {
        console.error("Error loading products:", error);
        setError(error.message || "Failed to load products");
        toast({
          title: "Error",
          description: "Failed to load products: " + (error.message || "Unknown error"),
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [userId, toast]);

  // Set up real-time subscription
  useEffect(() => {
    if (!userId) return;

    console.log("Setting up real-time subscription for products");
    
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'products',
          filter: `userid=eq.${userId}`
        },
        (payload) => {
          console.log('Real-time INSERT:', payload);
          const newProduct = payload.new as any;
          
          // Map database fields to Product interface
          const mappedProduct: Product = {
            id: newProduct.id,
            name: newProduct.name,
            price: newProduct.price,
            discount: newProduct.discount,
            description: newProduct.description,
            category: newProduct.category,
            brand: newProduct.brand,
            quantity: newProduct.quantity,
            expirationDate: newProduct.expirationdate,
            image: newProduct.image,
            storeId: newProduct.storeid,
            userId: newProduct.userid,
            barcode: newProduct.barcode,
            isMarketplaceVisible: newProduct.is_marketplace_visible,
            isSurpriseBag: newProduct.is_surprise_bag,
            originalPrice: newProduct.original_price,
            pickupTimeStart: newProduct.pickup_time_start,
            pickupTimeEnd: newProduct.pickup_time_end,
            surpriseBagContents: newProduct.surprise_bag_contents ? [newProduct.surprise_bag_contents] : undefined
          };

          setProducts(prev => [...prev, mappedProduct]);
          
          toast({
            title: "Product Added",
            description: `${newProduct.name} has been added to your inventory`,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
          filter: `userid=eq.${userId}`
        },
        (payload) => {
          console.log('Real-time UPDATE:', payload);
          const updatedProduct = payload.new as any;
          
          // Map database fields to Product interface
          const mappedProduct: Product = {
            id: updatedProduct.id,
            name: updatedProduct.name,
            price: updatedProduct.price,
            discount: updatedProduct.discount,
            description: updatedProduct.description,
            category: updatedProduct.category,
            brand: updatedProduct.brand,
            quantity: updatedProduct.quantity,
            expirationDate: updatedProduct.expirationdate,
            image: updatedProduct.image,
            storeId: updatedProduct.storeid,
            userId: updatedProduct.userid,
            barcode: updatedProduct.barcode,
            isMarketplaceVisible: updatedProduct.is_marketplace_visible,
            isSurpriseBag: updatedProduct.is_surprise_bag,
            originalPrice: updatedProduct.original_price,
            pickupTimeStart: updatedProduct.pickup_time_start,
            pickupTimeEnd: updatedProduct.pickup_time_end,
            surpriseBagContents: updatedProduct.surprise_bag_contents ? [updatedProduct.surprise_bag_contents] : undefined
          };

          setProducts(prev => 
            prev.map(product => 
              product.id === mappedProduct.id ? mappedProduct : product
            )
          );
          
          toast({
            title: "Product Updated",
            description: `${updatedProduct.name} has been updated`,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'products',
          filter: `userid=eq.${userId}`
        },
        (payload) => {
          console.log('Real-time DELETE:', payload);
          const deletedProduct = payload.old as any;
          
          setProducts(prev => 
            prev.filter(product => product.id !== deletedProduct.id)
          );
          
          toast({
            title: "Product Deleted",
            description: `Product has been removed from your inventory`,
          });
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      console.log("Cleaning up real-time subscription");
      supabase.removeChannel(channel);
    };
  }, [userId, toast]);

  const refreshProducts = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const userProducts = await productService.getProductsByUser(userId);
      setProducts(userProducts);
    } catch (error: any) {
      setError(error.message || "Failed to refresh products");
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    loading,
    error,
    refreshProducts,
    setProducts
  };
};