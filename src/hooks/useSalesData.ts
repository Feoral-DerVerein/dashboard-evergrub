
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { productSalesService, ProductSale } from "@/services/productSalesService";

export interface OrderAlert {
  id: string;
  total: number;
}

export function useSalesData() {
  const [todayRevenue, setTodayRevenue] = useState<number>(0);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [productSales, setProductSales] = useState<ProductSale[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [newAcceptedOrderId, setNewAcceptedOrderId] = useState<string | null>(null);
  const [newCompletedOrderId, setNewCompletedOrderId] = useState<string | null>(null);
  const [newCompletedOrderAmount, setNewCompletedOrderAmount] = useState<number | null>(null);
  const [newMarketplaceCompletedOrder, setNewMarketplaceCompletedOrder] = useState<OrderAlert | null>(null);
  const [newOrdersPageAccepted, setNewOrdersPageAccepted] = useState<OrderAlert | null>(null);

  const fetchOrdersData = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayFormatted = format(today, "yyyy-MM-dd");
      
      // First check if we can fetch today's orders
      const {
        data: checkData,
        error: checkError
      } = await supabase.from('orders').select('id').limit(1);
      
      if (checkError) {
        console.error("Error checking database connection:", checkError);
        return;
      }
      
      const {
        data: todayOrders,
        error: todayError
      } = await supabase.from('orders').select('total').gte('timestamp', todayFormatted);
      
      if (todayError) {
        console.error("Error fetching today's orders:", todayError);
        return;
      }
      
      const revenue = todayOrders?.reduce((sum, order) => sum + Number(order.total || 0), 0) || 0;
      setTodayRevenue(revenue);

      const {
        count,
        error: countError
      } = await supabase.from('orders').select('*', {
        count: 'exact',
        head: true
      }).eq('status', 'completed');
      
      if (countError) {
        console.error("Error counting orders:", countError);
        return;
      }
      
      setTotalOrders(count || 0);
      console.log("Total completed orders:", count);
    } catch (error) {
      console.error("Error in fetchOrdersData:", error);
    }
  };

  const fetchProductSales = async () => {
    setIsLoading(true);
    try {
      const sales = await productSalesService.getProductSales();
      console.log("Fetched product sales:", sales);
      setProductSales(sales);
    } catch (error) {
      console.error("Error fetching product sales:", error);
      toast.error("Failed to load product sales data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersData();
    fetchProductSales();
    
    const channel = supabase.channel('orders-channel').on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'orders',
      filter: "status=in.(accepted,completed)"
    }, payload => {
      console.log('Order status changed:', payload);
      if (payload.new && payload.new.status === 'accepted') {
        const fromOrdersPage = payload.new.from_orders_page === true;
        setNewAcceptedOrderId(payload.new.id);
        if (fromOrdersPage && payload.new.total) {
          setNewOrdersPageAccepted({
            id: payload.new.id,
            total: payload.new.total
          });
          setTimeout(() => {
            setNewOrdersPageAccepted(null);
          }, 10000);
          toast.success(`Order #${payload.new.id.substring(0, 8)} accepted from Orders`);
        } else {
          setTimeout(() => {
            setNewAcceptedOrderId(null);
          }, 5000);
          toast.success(`Order #${payload.new.id.substring(0, 8)} has been accepted and added to sales.`);
        }
      }
      if (payload.new && payload.new.status === 'completed' && payload.new.total) {
        console.log('Completed order detected:', payload.new);
        setNewCompletedOrderId(payload.new.id);
        setNewCompletedOrderAmount(payload.new.total);
        if (payload.new.user_id === null) {
          setNewMarketplaceCompletedOrder({
            id: payload.new.id,
            total: payload.new.total
          });
          setTimeout(() => {
            setNewMarketplaceCompletedOrder(null);
          }, 10000);
          toast.warning(`Order #${payload.new.id.substring(0, 8)} completed successfully. Sale: $${payload.new.total.toFixed(2)}`);
        } else {
          setTimeout(() => {
            setNewCompletedOrderId(null);
            setNewCompletedOrderAmount(null);
          }, 8000);
          toast.success(`Order #${payload.new.id.substring(0, 8)} completed successfully. Sale: $${payload.new.total.toFixed(2)}`);
        }
      }
      fetchProductSales();
      fetchOrdersData();
    }).on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'order_items'
    }, payload => {
      console.log('New order item added:', payload);
      fetchProductSales();
    }).subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    todayRevenue,
    totalOrders,
    productSales,
    isLoading,
    newAcceptedOrderId,
    newCompletedOrderId,
    newCompletedOrderAmount,
    newMarketplaceCompletedOrder,
    newOrdersPageAccepted,
    fetchProductSales,
    fetchOrdersData
  };
}
