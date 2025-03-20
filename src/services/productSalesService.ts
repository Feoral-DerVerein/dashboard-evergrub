
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface ProductSale {
  name: string;
  category: string;
  unitsSold: number;
  revenue: number;
  image: string;
}

export const productSalesService = {
  async getProductSales(): Promise<ProductSale[]> {
    try {
      console.log("Fetching product sales data from orders...");
      
      // Check database connection first
      const { data: connectionCheck, error: connectionError } = await supabase
        .from('orders')
        .select('id')
        .limit(1);
      
      if (connectionError) {
        console.error("Database connection error:", connectionError);
        toast.error("Could not connect to the database");
        return [];
      }
      
      // Get completed orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, status')
        .eq('status', 'completed');
      
      if (ordersError) {
        console.error("Error fetching completed orders:", ordersError);
        toast.error("Failed to fetch completed orders");
        return [];
      }
      
      if (!orders || orders.length === 0) {
        console.log("No completed orders found");
        return [];
      }
      
      console.log(`Found ${orders.length} completed orders`);
      
      // Get order IDs
      const orderIds = orders.map(order => order.id);
      
      // Get order items for these orders
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);
      
      if (itemsError) {
        console.error("Error fetching order items:", itemsError);
        toast.error("Failed to fetch order items");
        return [];
      }
      
      if (!orderItems || orderItems.length === 0) {
        console.log("No order items found for completed orders");
        return [];
      }

      console.log(`Processing ${orderItems.length} order items`);

      // Process order items into product sales
      const salesMap = new Map<string, ProductSale>();
      
      // Validate each order item before processing
      orderItems.forEach((item: any) => {
        // Skip invalid items
        if (!item || typeof item !== 'object') {
          console.warn("Skipping invalid order item:", item);
          return;
        }
        
        // Ensure name exists and is not empty
        if (!item.name || typeof item.name !== 'string') {
          console.warn("Skipping order item without valid name:", item);
          return;
        }
        
        // Use a consistent category
        const category = item.category && typeof item.category === 'string'
          ? item.category
          : 'Uncategorized';
        
        // Ensure price is a number
        const price = typeof item.price === 'number' || !isNaN(Number(item.price))
          ? Number(item.price)
          : 0;
        
        // Ensure quantity is a number
        const quantity = typeof item.quantity === 'number' || !isNaN(Number(item.quantity))
          ? Number(item.quantity)
          : 1;
        
        // Create a unique key for this product
        const key = `${item.name}-${category}`;
        
        if (salesMap.has(key)) {
          // Update existing product sale
          const existing = salesMap.get(key)!;
          existing.unitsSold += quantity;
          existing.revenue += price * quantity;
        } else {
          // Create new product sale
          const defaultImage = "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3";
          
          // Determine image source
          let imageSource = defaultImage;
          if (item.product_id && typeof item.product_id !== 'undefined') {
            imageSource = `/product-images/${item.product_id}.jpg`;
          }
          
          salesMap.set(key, {
            name: item.name,
            category: category,
            unitsSold: quantity,
            revenue: price * quantity,
            image: imageSource
          });
        }
      });
      
      // Convert map to array
      const productSales = Array.from(salesMap.values());
      
      console.log(`Generated ${productSales.length} product sales entries`);
      
      // Sort by revenue (highest first)
      return productSales.sort((a, b) => b.revenue - a.revenue);
    } catch (error) {
      console.error("Unexpected error in getProductSales:", error);
      toast.error("An unexpected error occurred while fetching sales data");
      return [];
    }
  }
};
