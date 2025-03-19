
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export function useNotificationsAndOrders() {
  const [orderCount, setOrderCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [lastOrderUpdate, setLastOrderUpdate] = useState<string | null>(null);
  const [lastOrderDelete, setLastOrderDelete] = useState<string | null>(null);

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

    // Set up real-time subscription for orders table
    const ordersChannel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Order change detected:', payload);
          
          if (payload.eventType === 'UPDATE' && payload.new && payload.new.id) {
            console.log(`Detectado cambio en orden: ${payload.new.id}, nuevo estado: ${payload.new.status}`);
            setLastOrderUpdate(payload.new.id);
          }
          
          if (payload.eventType === 'DELETE' && payload.old && payload.old.id) {
            console.log(`Detectada eliminación de orden: ${payload.old.id}`);
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
          fetchNotificationCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, []);

  return { orderCount, notificationCount, lastOrderUpdate, lastOrderDelete };
}
