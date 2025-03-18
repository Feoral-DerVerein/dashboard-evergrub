
import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingCart, Bell, User, Package, Search } from "lucide-react";
import { useUnreadNotificationsCount } from "../hooks/useNotifications";
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
            isActive("/") || isActive("/dashboard") ? "text-blue-600" : "text-gray-500"
          }`}
        >
          <Home className={`h-6 w-6 ${isActive("/") || isActive("/dashboard") ? "text-blue-600" : "text-gray-500"}`} />
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

// Add a default export for the Dashboard component
const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen pb-20">
        {/* Dashboard content */}
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
          
          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="stat-card">
              <h3 className="text-lg font-medium">Ventas</h3>
              <p className="text-2xl font-bold mt-2">$1,240</p>
              <p className="text-sm text-gray-500 mt-1">Último mes</p>
            </div>
            <div className="stat-card">
              <h3 className="text-lg font-medium">Órdenes</h3>
              <p className="text-2xl font-bold mt-2">24</p>
              <p className="text-sm text-gray-500 mt-1">Último mes</p>
            </div>
          </div>
          
          {/* Quick access */}
          <h2 className="text-xl font-semibold mb-4">Acceso rápido</h2>
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="quick-access-item">
              <ShoppingCart className="h-6 w-6 mb-2 text-blue-600" />
              <span className="text-xs text-center">Órdenes</span>
            </div>
            <div className="quick-access-item">
              <Package className="h-6 w-6 mb-2 text-blue-600" />
              <span className="text-xs text-center">Productos</span>
            </div>
            <div className="quick-access-item">
              <Bell className="h-6 w-6 mb-2 text-blue-600" />
              <span className="text-xs text-center">Notificaciones</span>
            </div>
          </div>
          
          {/* Recent activity */}
          <h2 className="text-xl font-semibold mb-4">Actividad reciente</h2>
          <div className="space-y-2">
            <div className="recent-activity-item">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Nueva orden</p>
                  <p className="text-sm text-gray-500">Hace 2 horas</p>
                </div>
              </div>
              <span className="text-sm font-medium">$24.99</span>
            </div>
            
            <div className="recent-activity-item">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Nuevo cliente</p>
                  <p className="text-sm text-gray-500">Hace 5 horas</p>
                </div>
              </div>
              <span className="text-sm font-medium">Laura M.</span>
            </div>
          </div>
        </div>
        
        <BottomNav />
      </div>
    </div>
  );
};

export default Dashboard;
