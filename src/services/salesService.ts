
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Sale {
  id: string;
  order_id: string;
  amount: number;
  customer_name: string;
  sale_date: string;
  payment_method: string;
  products: SaleProduct[];
  created_at: string;
}

export interface SaleProduct {
  name: string;
  quantity: number;
  price: number;
  category: string | null;
}

// Customer names array as specified
const customerNames = [
  "Lachlan", "Matilda", "Darcy", "Evie", "Banjo", 
  "Sienna", "Kieran", "Indi", "Heath", "Talia", "Jarrah"
];

// Helper function to get a consistent customer name based on order ID
const getConsistentCustomerName = (orderId: string) => {
  // Use the last character of the order ID to determine the index
  const lastChar = orderId.charAt(orderId.length - 1);
  const index = parseInt(lastChar, 16) % customerNames.length;
  return customerNames[index];
};

export const salesService = {
  async getSales(): Promise<Sale[]> {
    try {
      console.log("Fetching sales data...");
      
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('sale_date', { ascending: false });
      
      if (error) {
        console.error("Error fetching sales:", error);
        toast.error("Failed to load sales data");
        return [];
      }
      
      console.log("Fetched sales data:", data);
      
      // Transform the data to ensure the products field is correctly typed
      // and update the customer names based on order_id
      const transformedData = data.map(item => ({
        ...item,
        // Use our custom customer name based on order_id
        customer_name: getConsistentCustomerName(item.order_id || item.id),
        // Convert the JSON products data to the correct SaleProduct[] type
        products: Array.isArray(item.products) 
          ? item.products.map((product: any) => ({
              name: product.name || '',
              quantity: product.quantity || 0,
              price: product.price || 0,
              category: product.category
            }))
          : []
      }));
      
      return transformedData as Sale[];
    } catch (error) {
      console.error("Exception in getSales:", error);
      toast.error("Unexpected error fetching sales");
      return [];
    }
  },

  async getTodaySales(): Promise<{ count: number; total: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('amount')
        .gte('sale_date', today.toISOString());
      
      if (error) {
        console.error("Error fetching today's sales:", error);
        return { count: 0, total: 0 };
      }
      
      const total = data.reduce((sum, sale) => sum + Number(sale.amount), 0);
      return { count: data.length, total };
    } catch (error) {
      console.error("Exception in getTodaySales:", error);
      return { count: 0, total: 0 };
    }
  },
  
  // Manually create a sale record (backup in case trigger fails)
  async createSaleFromOrder(orderId: string): Promise<boolean> {
    try {
      console.log(`Manually creating sale record for order ${orderId}`);
      
      // First check if a sale already exists for this order
      const { data: existingSale, error: checkError } = await supabase
        .from('sales')
        .select('id')
        .eq('order_id', orderId)
        .maybeSingle();
        
      if (checkError) {
        console.error("Error checking for existing sale:", checkError);
        return false;
      }
      
      // If sale already exists, don't create another one
      if (existingSale) {
        console.log(`Sale already exists for order ${orderId}, skipping creation`);
        return true;
      }
      
      // Get order details
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
        
      if (orderError) {
        console.error("Error getting order for sale creation:", orderError);
        return false;
      }
      
      // Get order items
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);
        
      if (itemsError) {
        console.error("Error getting order items for sale creation:", itemsError);
        return false;
      }
      
      // Format products for sales record
      const products = orderItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        category: item.category
      }));
      
      // Use our custom customer name based on order ID
      const customerName = getConsistentCustomerName(orderId);
      
      // Create sale record
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert({
          order_id: orderId,
          amount: orderData.total,
          customer_name: customerName,
          sale_date: new Date().toISOString(),
          products: products,
          payment_method: 'card'
        })
        .select();
        
      if (saleError) {
        console.error("Error creating sale record:", saleError);
        return false;
      }
      
      console.log("Sale record created successfully:", saleData);
      return true;
    } catch (error) {
      console.error("Exception in createSaleFromOrder:", error);
      return false;
    }
  }
};
