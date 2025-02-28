
import { Home, ChartBar, Package, Bell, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const BottomNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    return currentPath === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 flex justify-between items-center">
      <Link
        to="/dashboard"
        className={`flex flex-col items-center ${
          isActive("/dashboard") ? "text-blue-600" : "text-gray-500"
        }`}
      >
        <Home className="h-6 w-6" />
        <span className="text-xs mt-1">Home</span>
      </Link>
      <Link
        to="/kpi"
        className={`flex flex-col items-center ${
          isActive("/kpi") ? "text-blue-600" : "text-gray-500"
        }`}
      >
        <ChartBar className="h-6 w-6" />
        <span className="text-xs mt-1">KPIs</span>
      </Link>
      <Link
        to="/products"
        className={`flex flex-col items-center ${
          isActive("/products") ? "text-blue-600" : "text-gray-500"
        }`}
      >
        <Package className="h-6 w-6" />
        <span className="text-xs mt-1">Products</span>
      </Link>
      <Link
        to="/notifications"
        className={`flex flex-col items-center ${
          isActive("/notifications") ? "text-blue-600" : "text-gray-500"
        }`}
      >
        <Bell className="h-6 w-6" />
        <span className="text-xs mt-1">Alerts</span>
      </Link>
      <Link
        to="/profile"
        className={`flex flex-col items-center ${
          isActive("/profile") ? "text-blue-600" : "text-gray-500"
        }`}
      >
        <User className="h-6 w-6" />
        <span className="text-xs mt-1">Profile</span>
      </Link>
    </div>
  );
};

export default BottomNav;
