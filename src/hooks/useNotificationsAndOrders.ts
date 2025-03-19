
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export function useNotificationsAndOrders() {
  const [orderCount, setOrderCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);

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
      const { data, error } = await supabase
        .from('notifications')
        .select('id')
        .eq('is_read', false);
      
      if (!error && data) {
        setNotificationCount(data.length);
      } else {
        setNotificationCount(3);
      }
    };

    fetchOrderCount();
    fetchNotificationCount();

    const ordersChannel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchOrderCount()
      )
      .subscribe();

    const notificationsChannel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        () => fetchNotificationCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, []);

  return { orderCount, notificationCount };
}
