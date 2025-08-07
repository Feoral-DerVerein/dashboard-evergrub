import { Link, Outlet } from "react-router-dom";
import { Home, ShoppingCart, Bell, User, Plus, ShoppingBasket, BarChart3, Megaphone, Heart, Coins, Handshake } from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";

const AppLayout = () => {

  return (
    <div className="min-h-screen bg-gray-50 md:flex md:items-center md:justify-center">
      <div className="w-full max-w-7xl mx-auto bg-white md:rounded-xl md:shadow-sm md:my-0 min-h-screen md:min-h-0">
        <div className="md:grid md:grid-cols-[220px_1fr]">
          {/* Sidebar - hide on dashboard to avoid duplication (dashboard already renders its own) */}
          {!isDashboard && (
            <aside className="hidden md:flex md:flex-col border-r border-gray-100 bg-gray-50/60 p-4 min-h-screen md:rounded-l-xl">
              <div className="mb-6 px-2">
                <img src="/lovable-uploads/25d0c5fc-4ab3-44dd-8e67-5e06c5a81537.png" alt="WiseBite Logo" className="h-8 w-auto" />
              </div>
              <nav className="space-y-1">
                <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700">
                  <Home className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link to="/kpi" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700">
                  <BarChart3 className="w-4 h-4" />
                  <span>Performance</span>
                </Link>
                <Link to="/products" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700">
                  <ShoppingCart className="w-4 h-4" />
                  <span>Products</span>
                </Link>
                <Link to="/orders" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700">
                  <ShoppingBasket className="w-4 h-4" />
                  <span>Orders</span>
                </Link>
                <Link to="/sales" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700">
                  <BarChart3 className="w-4 h-4" />
                  <span>Sales</span>
                </Link>
                <Link to="/notifications" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700">
                  <Bell className="w-4 h-4" />
                  <span>Notifications</span>
                </Link>
                <Link to="/ads" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700">
                  <Megaphone className="w-4 h-4" />
                  <span>Ads</span>
                </Link>
                <Link to="/donate" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700">
                  <Heart className="w-4 h-4" />
                  <span>Donate</span>
                </Link>
                <Link to="/grains" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700">
                  <Coins className="w-4 h-4" />
                  <span>Grains</span>
                </Link>
                <Link to="/partners" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700">
                  <Handshake className="w-4 h-4" />
                  <span>Partners</span>
                </Link>
              </nav>
              <div className="mt-auto pt-4 border-t border-gray-100">
                <LogoutButton />
              </div>
            </aside>
          )}

          {/* Routed content */}
          <div>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
