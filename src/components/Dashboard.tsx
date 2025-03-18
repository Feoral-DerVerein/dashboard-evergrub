import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingCart, Bell, User, Package, Search } from "lucide-react";
import { useUnreadNotificationsCount } from "@/pages/Notifications";
import { NotificationBadge } from "@/components/ui/notification-badge";

export function BottomNav() {
  const location = useLocation();
  const unreadCount = useUnreadNotificationsCount();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3">
      <div className="max-w-md mx-auto flex justify-around items-center">
        <Link
          to="/"
          className={`flex flex-col items-center space-y-1 ${
            isActive("/") ? "text-blue-600" : "text-gray-500"
          }`}
        >
          <Home className={`h-6 w-6 ${isActive("/") ? "text-blue-600" : "text-gray-500"}`} />
          <span className="text-xs">Home</span>
        </Link>

        <Link
          to="/orders"
          className={`flex flex-col items-center space-y-1 ${
            isActive("/orders") ? "text-blue-600" : "text-gray-500"
          }`}
        >
          <div className="relative">
            <ShoppingCart className={`h-6 w-6 ${isActive("/orders") ? "text-blue-600" : "text-gray-500"}`} />
            <NotificationBadge count={unreadCount} />
          </div>
          <span className="text-xs">Orders</span>
        </Link>

        <Link
          to="/notifications"
          className={`flex flex-col items-center space-y-1 ${
            isActive("/notifications") ? "text-blue-600" : "text-gray-500"
          }`}
        >
          <div className="relative">
            <Bell className={`h-6 w-6 ${isActive("/notifications") ? "text-blue-600" : "text-gray-500"}`} />
            <NotificationBadge count={unreadCount} />
          </div>
          <span className="text-xs">Notifications</span>
        </Link>

        <Link
          to="/profile"
          className={`flex flex-col items-center space-y-1 ${
            isActive("/profile") ? "text-blue-600" : "text-gray-500"
          }`}
        >
          <User className={`h-6 w-6 ${isActive("/profile") ? "text-blue-600" : "text-gray-500"}`} />
          <span className="text-xs">Profile</span>
        </Link>
      </div>
    </div>
  );
}
