import {
  Home,
  User,
  Bell,
  Plus,
  AlignJustify,
  Apple,
  ArrowRight,
  Gift,
  Package,
  CircleDollarSign,
  Wallet,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-6">
      <div className="max-w-md mx-auto flex justify-between items-center">
        <Link
          to="/dashboard"
          className="flex flex-col items-center gap-1 text-gray-600"
        >
          <Home className="w-6 h-6" />
          <span className="text-xs">Home</span>
        </Link>
        <Link
          to="/profile"
          className="flex flex-col items-center gap-1 text-gray-600"
        >
          <User className="w-6 h-6" />
          <span className="text-xs">Profile</span>
        </Link>
        <Link
          to="/notifications"
          className="flex flex-col items-center gap-1 text-gray-600"
        >
          <Bell className="w-6 h-6" />
          <span className="text-xs">Notifications</span>
        </Link>
        <Link
          to="/parcel"
          className="flex flex-col items-center gap-1 text-gray-600"
        >
          <Plus className="w-6 h-6" />
          <span className="text-xs">Parcel</span>
        </Link>
      </div>
    </nav>
  );
};

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <header className="px-6 pt-8 pb-6 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-500">Welcome back, Olivia</p>
            </div>
            <Button variant="ghost" size="icon">
              <Bell className="w-6 h-6" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-500 p-4 rounded-xl">
              <h3 className="text-white text-sm mb-1">Total Revenue</h3>
              <p className="text-white text-2xl font-semibold">$2,847</p>
            </div>
            <div className="bg-green-600 p-4 rounded-xl">
              <h3 className="text-white text-sm mb-1">Total Orders</h3>
              <p className="text-white text-2xl font-semibold">126</p>
            </div>
          </div>
        </header>

        <main className="px-6">
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/products"
                className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Package className="w-6 h-6 text-blue-500 mb-2" />
                <span className="text-gray-700 font-medium">Products</span>
              </Link>
              <Link
                to="/orders"
                className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <CircleDollarSign className="w-6 h-6 text-green-600 mb-2" />
                <span className="text-gray-700 font-medium">Orders</span>
              </Link>
              <Link
                to="/users"
                className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <User className="w-6 h-6 text-purple-500 mb-2" />
                <span className="text-gray-700 font-medium">Users</span>
              </Link>
              <Link
                to="/sales"
                className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Wallet className="w-6 h-6 text-orange-500 mb-2" />
                <span className="text-gray-700 font-medium">Sales</span>
              </Link>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
            <ul>
              <li className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <h3 className="font-medium text-gray-900">Order #1234</h3>
                  <p className="text-gray-500 text-sm">August 1, 2023</p>
                </div>
                <span className="text-green-600 font-semibold">$45.00</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </li>
              <li className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <h3 className="font-medium text-gray-900">Order #1233</h3>
                  <p className="text-gray-500 text-sm">July 31, 2023</p>
                </div>
                <span className="text-green-600 font-semibold">$72.00</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </li>
              <li className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <h3 className="font-medium text-gray-900">Order #1232</h3>
                  <p className="text-gray-500 text-sm">July 30, 2023</p>
                </div>
                <span className="text-green-600 font-semibold">$125.00</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </li>
            </ul>
          </section>
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

export default Dashboard;
