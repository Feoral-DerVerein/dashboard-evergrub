import { useState, useEffect } from "react";
import { Bell, Eye, Heart, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BottomNav } from "@/components/Dashboard";
import { Button } from "@/components/ui/button";
import { notificationService, Notification } from "@/services/notificationService";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { wishlistService } from "@/services/wishlistService";
import NotificationIcon from "@/components/notifications/NotificationIcon";
import WishlistNotificationCard from "@/components/notifications/WishlistNotificationCard";
import StandardNotification from "@/components/notifications/StandardNotification";
import ProductNotificationList from "@/components/notifications/ProductNotificationList";
const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"all" | "wishlist" | "products">("all");
  const {
    toast
  } = useToast();
  const totalNotifications = notifications.length;
  const currentPage = 1;
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalNotifications / itemsPerPage);
  useEffect(() => {
    if (viewMode !== "products") {
      loadNotifications();
    }
  }, [viewMode]);
  const loadNotifications = async () => {
    try {
      console.log("Loading notifications, viewMode:", viewMode);
      setLoading(true);
      let data;
      if (viewMode === "wishlist") {
        data = await notificationService.getAllNotifications().then(allNotifications => allNotifications.filter(n => n.type === 'wishlist'));
      } else {
        data = await notificationService.getAllNotifications();
      }
      console.log("Fetched notifications:", data);
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
  const handleNotifyWishlistUsers = async (productId: number) => {
    try {
      await wishlistService.notifyWishlistUsers(productId);
      toast({
        title: "Success",
        description: "Wishlist users have been notified"
      });
    } catch (error) {
      console.error("Error notifying wishlist users:", error);
      toast({
        title: "Error",
        description: "Failed to notify wishlist users",
        variant: "destructive"
      });
    }
  };
  const handleAddSampleProducts = async () => {
    try {
      setLoading(true);
      await notificationService.createSampleProductNotifications();
      toast({
        title: "Success",
        description: "Sample product notifications added"
      });
      await loadNotifications();
    } catch (error) {
      console.error("Error adding sample products:", error);
      toast({
        title: "Error",
        description: "Failed to add sample products",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const filteredNotifications = searchQuery.trim() === "" ? notifications : notifications.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.description.toLowerCase().includes(searchQuery.toLowerCase()));
  const renderContent = () => {
    if (viewMode === "products") {
      return <ProductNotificationList />;
    }
    if (loading) {
      return <div className="space-y-6">
          {[1, 2, 3].map(i => <div key={i} className="flex items-start space-x-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-5 w-2/3 mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>)}
        </div>;
    }
    if (filteredNotifications.length === 0) {
      return <div className="text-center py-10">
          <Bell className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="font-medium text-gray-700 mb-1">No hay notificaciones</h3>
          <p className="text-gray-500">No tienes notificaciones todavía</p>
        </div>;
    }
    return <div className="space-y-6">
        {viewMode === "wishlist" ? <div className="grid grid-cols-1 gap-4">
            {filteredNotifications.map(notification => <WishlistNotificationCard key={notification.id} notification={notification} onNotifyUsers={handleNotifyWishlistUsers} onMarkAsRead={handleMarkAsRead} />)}
          </div> : filteredNotifications.map(notification => <StandardNotification key={notification.id} notification={notification} onNotifyUsers={handleNotifyWishlistUsers} onMarkAsRead={handleMarkAsRead} />)}
      </div>;
  };
  return (
    <>
      <header className="px-6 pt-8 pb-6 sticky top-0 bg-white z-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Notifications</h1>
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 rounded-full text-sm ${viewMode === "all" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}
              onClick={() => setViewMode("all")}
            >
              All
            </button>
            
            <button
              className={`px-3 py-1 rounded-full text-sm ${viewMode === "products" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}
              onClick={() => setViewMode("products")}
            >
              <ShoppingCart className="w-3 h-3 inline-block mr-1" />
              Wishlist
            </button>
          </div>
        </div>
        
        <div className="relative">
          <Input
            type="search"
            placeholder="Search notifications..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg className="w-4 h-4 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div className="mt-4"></div>
      </header>

      <main className="px-6">
        {viewMode !== "products" && (
          <p className="text-gray-500 mb-6">
            You have {filteredNotifications.length} {filteredNotifications.length === 1 ? "notification" : "notifications"}
          </p>
        )}

        {renderContent()}

        {viewMode !== "products" && filteredNotifications.length > itemsPerPage && (
          <div className="flex justify-center items-center space-x-2 my-8">
            <button className="p-2 hover:bg-gray-100 rounded-full" disabled={currentPage === 1}>
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`w-8 h-8 rounded-full ${currentPage === i + 1 ? "bg-blue-600 text-white" : "hover:bg-gray-100"}`}
              >
                {i + 1}
              </button>
            ))}
            <button className="p-2 hover:bg-gray-100 rounded-full" disabled={currentPage === totalPages}>
              &gt;
            </button>
          </div>
        )}
      </main>

      <BottomNav />
    </>
  );
};
export default Notifications;