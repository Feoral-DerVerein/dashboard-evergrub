import { Link, Outlet, useLocation } from "react-router-dom";
import { Home, ShoppingCart, Bell, User, Plus, ShoppingBasket, BarChart3, Megaphone, Heart, Coins, Handshake } from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";
const AppLayout = () => {
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";
  return;
};
export default AppLayout;