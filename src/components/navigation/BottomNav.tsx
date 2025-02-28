
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, ShoppingBag, Heart, Bell, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if user is logged in
  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (!userJson && location.pathname !== '/') {
      navigate('/');
    }
  }, [location.pathname, navigate]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-2 flex justify-around items-center px-6 max-w-md mx-auto z-20">
      <Link to="/dashboard" className={`flex flex-col items-center ${location.pathname === "/dashboard" ? "text-blue-600" : "text-gray-500"}`}>
        <Home className="h-6 w-6" />
        <span className="text-xs mt-1">Home</span>
      </Link>
      <Link to="/orders" className={`flex flex-col items-center ${location.pathname === "/orders" ? "text-blue-600" : "text-gray-500"}`}>
        <ShoppingBag className="h-6 w-6" />
        <span className="text-xs mt-1">Orders</span>
      </Link>
      <Link to="/wishlist" className={`flex flex-col items-center ${location.pathname === "/wishlist" ? "text-blue-600" : "text-gray-500"}`}>
        <Heart className="h-6 w-6" />
        <span className="text-xs mt-1">Wishlist</span>
      </Link>
      <Link to="/notifications" className="relative flex flex-col items-center text-gray-500">
        <Bell className="h-6 w-6" />
        <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">3</Badge>
        <span className="text-xs mt-1">Alerts</span>
      </Link>
      <Link to="/account" className={`flex flex-col items-center ${location.pathname === "/account" ? "text-blue-600" : "text-gray-500"}`}>
        <User className="h-6 w-6" />
        <span className="text-xs mt-1">Account</span>
      </Link>
    </div>
  );
};

export default BottomNav;
