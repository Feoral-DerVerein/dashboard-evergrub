
import { supabase } from "@/integrations/supabase/client";
import { OrderItem } from "@/types/order.types";

export interface ProductSale {
  name: string;
  category: string;
  unitsSold: number;
  revenue: number;
  image: string;
}

export const productSalesService = {
  // Get product sales from accepted and completed orders
  async getProductSales(): Promise<ProductSale[]> {
    try {
      console.log("Fetching product sales data from orders...");
      
      // Get orders that are accepted or completed
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, status')
        .in('status', ['accepted', 'completed']);
      
      if (ordersError) {
        console.error("Error fetching orders for product sales:", ordersError);
        throw ordersError;
      }
      
      if (!orders || orders.length === 0) {
        console.log("No accepted or completed orders found");
        return [];
      }
      
      console.log("Found orders with status accepted/completed:", orders.length);
      
      // Get order IDs
      const orderIds = orders.map(order => order.id);
      
      // Get order items for these orders
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);
      
      if (itemsError) {
        console.error("Error fetching order items for sales:", itemsError);
        throw itemsError;
      }
      
      if (!orderItems || orderItems.length === 0) {
        console.log("No order items found for the accepted/completed orders");
        return [];
      }

      console.log("Raw order items data:", orderItems);

      // Process order items into product sales
      const salesMap = new Map<string, ProductSale>();
      
      orderItems.forEach((item: any) => {
        const key = `${item.name}-${item.category || 'Uncategorized'}`;
        
        if (salesMap.has(key)) {
          // Update existing product sale
          const existing = salesMap.get(key)!;
          existing.unitsSold += item.quantity;
          existing.revenue += Number(item.price) * item.quantity;
        } else {
          // Create new product sale
          salesMap.set(key, {
            name: item.name,
            category: item.category || 'Uncategorized',
            unitsSold: item.quantity,
            revenue: Number(item.price) * item.quantity,
            // Use a default image or try to find a product image
            image: item.product_id 
              ? `/product-images/${item.product_id}.jpg` 
              : "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
          });
        }
      });
      
      // Convert map to array
      const productSales = Array.from(salesMap.values());
      
      console.log("Processed product sales:", productSales);
      
      // Sort by revenue (highest first)
      return productSales.sort((a, b) => b.revenue - a.revenue);
    } catch (error) {
      console.error("Error in getProductSales:", error);
      return [];
    }
  }
};
