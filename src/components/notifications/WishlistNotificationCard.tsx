
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Eye, Heart } from "lucide-react";
import { Notification } from "@/services/notificationService";

interface WishlistNotificationCardProps {
  notification: Notification;
  onNotifyUsers: (productId: number) => Promise<void>;
  onMarkAsRead: (notificationId: string) => Promise<void>;
}

const WishlistNotificationCard = ({ 
  notification,
  onNotifyUsers,
  onMarkAsRead
}: WishlistNotificationCardProps) => {
  const productImageUrl = notification.product_image || '/placeholder.svg';
  const productName = notification.title.replace('New wishlist item:', '').trim();
  const productPrice = notification.product_price || '0.00';
  
  return (
    <Card className={`overflow-hidden ${!notification.is_read ? 'border-l-4 border-l-red-500' : ''}`}>
      <div className="aspect-video relative bg-gray-100">
        <img 
          src={productImageUrl} 
          alt={productName} 
          className="w-full h-full object-cover"
        />
        <Badge 
          variant="destructive" 
          className="absolute top-2 right-2"
        >
          <Heart className="w-3 h-3 mr-1" /> Wishlist
        </Badge>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-medium text-lg">{productName}</h3>
        <p className="text-gray-500 text-sm">{notification.description}</p>
        {notification.product_price && (
          <div className="mt-2">
            <span className="font-bold text-lg">${parseFloat(productPrice).toFixed(2)}</span>
          </div>
        )}
        <p className="text-xs text-gray-400 mt-2">
          {new Date(notification.timestamp).toLocaleString()}
        </p>
      </CardContent>
      
      <CardFooter className="flex justify-between p-4 pt-0 gap-2">
        {!notification.is_read && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onMarkAsRead(notification.id)}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-1" />
            Mark as read
          </Button>
        )}
        
        {notification.product_id && (
          <Button 
            variant="default"
            size="sm"
            onClick={() => notification.product_id && onNotifyUsers(notification.product_id)}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Bookmark className="w-4 h-4 mr-1" />
            Notify Users
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default WishlistNotificationCard;
