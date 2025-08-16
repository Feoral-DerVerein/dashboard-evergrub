
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export function useNotificationsAndOrders() {
  const [orderCount, setOrderCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [salesCount, setSalesCount] = useState(0);
  const [lastOrderUpdate, setLastOrderUpdate] = useState<string | null>(null);
  const [lastOrderDelete, setLastOrderDelete] = useState<string | null>(null);
  const [lastNotificationUpdate, setLastNotificationUpdate] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderCount = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id')
        .eq('status', 'pending');
      
      if (!error && data) {
        setOrderCount(data.length);
      }
    };

    const fetchNotificationCount = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('id')
          .eq('is_read', false);
        
        if (error) {
          throw error;
        }
        
        console.log("Notifications count:", data?.length || 0);
        setNotificationCount(data?.length || 0);
      } catch (error) {
        console.error("Error fetching notifications count:", error);
        // Default to 3 notifications as in the original code
        setNotificationCount(3);
      }
    };

    const fetchSalesCount = async () => {
      try {
        const { data, error } = await supabase
          .from('sales')
          .select('id')
          .gte('sale_date', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours
        
        if (error) {
          throw error;
        }
        
        setSalesCount(data?.length || 0);
      } catch (error) {
        console.error("Error fetching sales count:", error);
        setSalesCount(0);
      }
    };

    fetchOrderCount();
    fetchNotificationCount();
    fetchSalesCount();

    // Set up real-time subscription for orders table
    const ordersChannel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Order change detected:', payload);
          
          if (payload.eventType === 'UPDATE' && payload.new && payload.new.id) {
            console.log(`Order change detected: ${payload.new.id}, new status: ${payload.new.status}`);
            setLastOrderUpdate(payload.new.id);
          }
          
          if (payload.eventType === 'DELETE' && payload.old && payload.old.id) {
            console.log(`Order deletion detected: ${payload.old.id}`);
            setLastOrderDelete(payload.old.id);
          }
          
          fetchOrderCount();
        }
      )
      .subscribe();

    // Set up real-time subscription for notifications table
    const notificationsChannel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          console.log('Notification change detected:', payload);
          if (payload.eventType === 'INSERT' && payload.new) {
            toast({
              title: "New Notification",
              description: payload.new.title
            });
            setLastNotificationUpdate(payload.new.id);
          }
          fetchNotificationCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, []);

  return { 
    orderCount, 
    notificationCount,
    salesCount,
    lastOrderUpdate, 
    lastOrderDelete,
    lastNotificationUpdate 
  };
}
