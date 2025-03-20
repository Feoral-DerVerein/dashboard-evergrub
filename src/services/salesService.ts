
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
      return data as Sale[];
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
  }
};
