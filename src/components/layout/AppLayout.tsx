import { Link, Outlet, useLocation } from "react-router-dom";
import { ShoppingCart, Bell, User, Plus, ShoppingBasket, BarChart3, Megaphone, Heart, Coins, Sparkles, Settings, Store } from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";
import { useNotificationsAndOrders } from "@/hooks/useNotificationsAndOrders";
const AppLayout = () => {
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";
  const {
    notificationCount,
    orderCount,
    salesCount
  } = useNotificationsAndOrders();
  return <div className="min-h-screen bg-gray-50 md:flex md:items-center md:justify-center">
      <div className="w-full max-w-7xl mx-auto glass-card md:rounded-xl md:my-0 min-h-screen md:min-h-0">
        <div className={isDashboard ? "" : "md:grid md:grid-cols-[220px_1fr]"}>
          {/* Sidebar - hide on dashboard to avoid duplication (dashboard already renders its own) */}
          {!isDashboard && <aside className="hidden md:flex md:flex-col border-r border-gray-100 bg-gray-50/60 p-4 min-h-screen md:rounded-l-xl">
              <div className="mb-6 px-2">
                <img src="/lovable-uploads/57a9a6e0-d484-424e-b78c-34034334c2f7.png" alt="Main Logo" className="h-10 w-auto" />
              </div>
              <nav className="space-y-1">
                <Link to="/kpi" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700">
                  <BarChart3 className="w-4 h-4" />
                  <span>Performance</span>
                </Link>
                <Link to="/products" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700">
                  <ShoppingCart className="w-4 h-4" />
                  <span>Stock</span>
                </Link>
                <Link to="/orders" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700">
                  <ShoppingBasket className="w-4 h-4" />
                  <span>Orders</span>
                  {orderCount > 0 && <span className="text-sm text-gray-500">({orderCount})</span>}
                </Link>
                <Link to="/sales" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700">
                  <BarChart3 className="w-4 h-4" />
                  <span>Sales</span>
                  {salesCount > 0 && <span className="text-sm text-gray-500">({salesCount})</span>}
                </Link>
                <Link to="/notifications" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 relative">
                  <Bell className="w-4 h-4" />
                  <span>Notifications</span>
                  {notificationCount > 0 && <span className="text-sm text-gray-500">({notificationCount})</span>}
                  {notificationCount > 0}
                </Link>
                <Link to="/ads" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700">
                  <Megaphone className="w-4 h-4" />
                  <span>Ads</span>
                </Link>
                
                <Link to="/market" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700">
                  <Store className="w-4 h-4" />
                  <span>Market</span>
                </Link>
                <Link to="/configuration" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
              </nav>
              <div className="mt-auto pt-4 border-t border-gray-100">
                <LogoutButton />
              </div>
            </aside>}

          {/* Routed content */}
          <div>
            <Outlet />
          </div>
        </div>
      </div>
    </div>;
};
export default AppLayout;