
import { useState, useEffect } from "react";
import { notificationService } from "@/services/notificationService";

export const useUnreadNotificationsCount = () => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const notifications = await notificationService.getMarketplaceNotifications();
        const unread = notifications.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error("Error fetching unread notifications count:", error);
      }
    };
    
    fetchUnreadCount();
    
    // Set up polling every 30 seconds to check for new notifications
    const intervalId = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return unreadCount;
};
