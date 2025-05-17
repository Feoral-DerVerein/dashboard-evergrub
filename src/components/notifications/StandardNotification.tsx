
import { Eye, Bookmark, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Notification } from "@/services/notificationService";
import NotificationIcon from "./NotificationIcon";

interface StandardNotificationProps {
  notification: Notification;
  onNotifyUsers: (productId: number) => Promise<void>;
  onMarkAsRead: (notificationId: string) => Promise<void>;
}

const StandardNotification = ({ 
  notification,
  onNotifyUsers,
  onMarkAsRead
}: StandardNotificationProps) => {
  const isWishlistItem = notification.type === 'wishlist';
  
  return (
    <div className={`flex items-start space-x-4 p-3 rounded-lg ${!notification.is_read ? 'bg-blue-50' : ''}`}>
      <NotificationIcon type={notification.type} />
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h3 className={`font-medium ${!notification.is_read ? 'text-blue-900' : 'text-gray-900'}`}>
            {notification.title}
          </h3>
          {isWishlistItem && <Badge variant="outline" className="ml-2 bg-red-50 text-red-600">Wishlist</Badge>}
        </div>
        <p className={`${!notification.is_read ? 'text-blue-700' : 'text-gray-500'}`}>
          {notification.description}
        </p>
        {notification.customer_name && (
          <div className="flex items-center mt-1 text-xs text-gray-500">
            <User className="w-3 h-3 mr-1" />
            <span>Added by: {notification.customer_name}</span>
          </div>
        )}
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-gray-400">
            {new Date(notification.timestamp).toLocaleString()}
          </p>
          <div className="flex gap-2">
            {!notification.is_read && (
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => onMarkAsRead(notification.id)}>
                <Eye className="w-3 h-3 mr-1" />
                Mark as read
              </Button>
            )}
            {isWishlistItem && notification.product_id && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100" 
                onClick={() => notification.product_id && onNotifyUsers(notification.product_id)}
              >
                <Bookmark className="w-3 h-3 mr-1" />
                Notify Users
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StandardNotification;
