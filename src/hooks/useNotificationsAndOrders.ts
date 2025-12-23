import { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, getDocs } from "firebase/firestore";
import { toast } from "@/components/ui/use-toast";

export function useNotificationsAndOrders() {
  const [orderCount, setOrderCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [salesCount, setSalesCount] = useState(0);
  const [lastOrderUpdate, setLastOrderUpdate] = useState<string | null>(null);
  const [lastOrderDelete, setLastOrderDelete] = useState<string | null>(null);
  const [lastNotificationUpdate, setLastNotificationUpdate] = useState<string | null>(null);

  useEffect(() => {
    // 1. Orders subscription (pending)
    const qOrders = query(collection(db, 'orders'), where('status', '==', 'pending'));
    const unsubscribeOrders = onSnapshot(qOrders, (snapshot) => {
      setOrderCount(snapshot.size);

      snapshot.docChanges().forEach((change) => {
        if (change.type === "added" || change.type === "modified") {
          // Not exact "update" vs "insert" matching like Postgres, but good enough signal
          setLastOrderUpdate(change.doc.id);
        }
        if (change.type === "removed") {
          setLastOrderDelete(change.doc.id);
        }
      });
    });

    // 2. Notifications subscription (unread)
    const qNotifications = query(collection(db, 'notifications'), where('is_read', '==', false));
    const unsubscribeNotifications = onSnapshot(qNotifications, (snapshot) => {
      console.log("Notifications count:", snapshot.size);
      setNotificationCount(snapshot.size);

      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          toast({
            title: "New Notification",
            description: data.title
          });
          setLastNotificationUpdate(change.doc.id);
        }
      });
    });

    // 3. Sales Count (last 24 hours) - One-off fetch for now to save reads, or could be realtime too
    // Keeping it simple with one-off as per previous logic (though previous logic was re-fetched on changes)
    const fetchSalesCount = async () => {
      try {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const qSales = query(collection(db, 'sales'), where('sale_date', '>=', yesterday));
        const snapshot = await getDocs(qSales);
        setSalesCount(snapshot.size);
      } catch (error) {
        console.error("Error fetching sales count:", error);
        setSalesCount(0);
      }
    };

    fetchSalesCount();

    return () => {
      unsubscribeOrders();
      unsubscribeNotifications();
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
