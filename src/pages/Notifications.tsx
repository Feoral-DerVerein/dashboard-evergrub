import { useState, useEffect } from "react";
import { Bell, Eye, AlertTriangle, Heart, BarChart, ShoppingBag, Check, Clock, DollarSign, ShoppingCart } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { BottomNav } from "@/components/Dashboard";
import { Button } from "@/components/ui/button";
import { notificationService, Notification } from "@/services/notificationService";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { wishlistService } from "@/services/wishlistService";
const NotificationIcon = ({
  type
}: {
  type: string;
}) => {
  const iconProps = {
    className: "w-6 h-6"
  };
  const wrapperClassName = "w-10 h-10 rounded-full flex items-center justify-center";
  switch (type) {
    case "order":
      return <div className={`${wrapperClassName} bg-green-100`}><ShoppingBag {...iconProps} className="text-green-600" /></div>;
    case "stock":
      return <div className={`${wrapperClassName} bg-red-100`}><AlertTriangle {...iconProps} className="text-red-600" /></div>;
    case "pickup":
      return <div className={`${wrapperClassName} bg-blue-100`}><ShoppingCart {...iconProps} className="text-blue-600" /></div>;
    case "sales":
      return <div className={`${wrapperClassName} bg-green-100`}><DollarSign {...iconProps} className="text-green-600" /></div>;
    case "purchase":
      return <div className={`${wrapperClassName} bg-purple-100`}><ShoppingCart {...iconProps} className="text-purple-600" /></div>;
    case "expiration":
      return <div className={`${wrapperClassName} bg-amber-100`}><Clock {...iconProps} className="text-amber-600" /></div>;
    case "wishlist":
      return <div className={`${wrapperClassName} bg-red-100`}><Heart {...iconProps} className="text-red-600" /></div>;
    case "report":
      return <div className={`${wrapperClassName} bg-purple-100`}><BarChart {...iconProps} className="text-purple-600" /></div>;
    default:
      return <div className={`${wrapperClassName} bg-gray-100`}><Bell {...iconProps} className="text-gray-600" /></div>;
  }
};
const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"marketplace" | "all" | "admin">("all");
  const {
    toast
  } = useToast();
  const totalNotifications = notifications.length;
  const currentPage = 1;
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalNotifications / itemsPerPage);
  useEffect(() => {
    loadNotifications();
  }, [viewMode]);
  const loadNotifications = async () => {
    try {
      setLoading(true);
      let data;
      if (viewMode === "marketplace") {
        data = await notificationService.getMarketplaceNotifications();
      } else if (viewMode === "admin") {
        data = await notificationService.getAllNotifications().then(allNotifications => allNotifications.filter(n => !n.for_marketplace));
      } else {
        data = await notificationService.getAllNotifications();
      }
      setNotifications(data);
    } catch (error) {
      console.error("Error loading notifications:", error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(notifications.map(n => n.id === notificationId ? {
        ...n,
        is_read: true
      } : n));
      toast({
        title: "Success",
        description: "Notification marked as read"
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive"
      });
    }
  };
  const filteredNotifications = searchQuery.trim() === "" ? notifications : notifications.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.description.toLowerCase().includes(searchQuery.toLowerCase()));
  return <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <header className="px-6 pt-8 pb-6 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Notifications</h1>
            <div className="flex gap-2">
              <button className={`px-3 py-1 rounded-full text-sm ${viewMode === "all" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`} onClick={() => setViewMode("all")}>
                All
              </button>
              <button className={`px-3 py-1 rounded-full text-sm ${viewMode === "marketplace" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`} onClick={() => setViewMode("marketplace")}>Wishlist</button>
              
            </div>
          </div>
          <div className="relative">
            <Input type="search" placeholder="Search notifications..." className="w-full pl-10 pr-4 py-2 border rounded-lg" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <svg className="w-4 h-4 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </header>

        <main className="px-6">
          <p className="text-gray-500 mb-6">
            You have {filteredNotifications.length} {filteredNotifications.length === 1 ? "notification" : "notifications"}
          </p>

          {loading ? <div className="space-y-6">
              {[1, 2, 3].map(i => <div key={i} className="flex items-start space-x-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-2/3 mb-1" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>)}
            </div> : filteredNotifications.length > 0 ? <div className="space-y-6">
              {filteredNotifications.map(notification => <div key={notification.id} className={`flex items-start space-x-4 p-3 rounded-lg ${!notification.is_read ? 'bg-blue-50' : ''}`}>
                  <NotificationIcon type={notification.type} />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className={`font-medium ${!notification.is_read ? 'text-blue-900' : 'text-gray-900'}`}>
                        {notification.title}
                      </h3>
                      {notification.type === 'wishlist' && !notification.for_marketplace && <Badge variant="info" className="ml-2">Wishlist Item</Badge>}
                    </div>
                    <p className={`${!notification.is_read ? 'text-blue-700' : 'text-gray-500'}`}>
                      {notification.description}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm text-gray-400">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                      <div className="flex gap-2">
                        {!notification.is_read && <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => handleMarkAsRead(notification.id)}>
                            <Eye className="w-3 h-3 mr-1" />
                            Mark as read
                          </Button>}
                        {notification.type === 'wishlist' && !notification.for_marketplace && notification.product_id && <Button variant="outline" size="sm" className="h-8 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100" onClick={() => {
                    if (notification.product_id) {
                      wishlistService.notifyWishlistUsers(notification.product_id);
                    }
                  }}>
                            <Bell className="w-3 h-3 mr-1" />
                            Notify Users
                          </Button>}
                      </div>
                    </div>
                  </div>
                </div>)}
            </div> : <div className="text-center py-10">
              <Bell className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="font-medium text-gray-700 mb-1">No notifications</h3>
              <p className="text-gray-500">You don't have any notifications yet</p>
            </div>}

          {filteredNotifications.length > itemsPerPage && <div className="flex justify-center items-center space-x-2 my-8">
              <button className="p-2 hover:bg-gray-100 rounded-full" disabled={currentPage === 1}>
                &lt;
              </button>
              {Array.from({
            length: totalPages
          }, (_, i) => <button key={i + 1} className={`w-8 h-8 rounded-full ${currentPage === i + 1 ? "bg-blue-600 text-white" : "hover:bg-gray-100"}`}>
                  {i + 1}
                </button>)}
              <button className="p-2 hover:bg-gray-100 rounded-full" disabled={currentPage === totalPages}>
                &gt;
              </button>
            </div>}
        </main>

        <BottomNav />
      </div>
    </div>;
};
export default Notifications;