
import { Home, Users, ShoppingCart, BarChart, Bell, Heart, User, Package, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";

const QuickAccessItem = ({ icon: Icon, label, to }: { icon: any; label: string; to?: string }) => (
  <Link to={to || "/"} className="quick-access-item">
    <Icon className="w-6 h-6 text-gray-600 mb-2" />
    <span className="text-sm text-gray-600">{label}</span>
  </Link>
);

const StatCard = ({ label, value, trend }: { label: string; value: string; trend?: string }) => (
  <div className="stat-card">
    <h3 className="text-gray-500 text-sm mb-2">{label}</h3>
    <p className="text-2xl font-semibold mb-1">{value}</p>
    {trend && <span className="positive-trend">↑ {trend}</span>}
  </div>
);

const RecentActivityItem = ({ title, time, amount }: { title: string; time: string; amount?: string }) => (
  <div className="recent-activity-item">
    <div>
      <p className="font-medium text-gray-900">{title}</p>
      <p className="text-sm text-gray-500">{time}</p>
    </div>
    {amount && <span className="font-medium">{amount}</span>}
  </div>
);

export const BottomNav = () => (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between">
    <Link to="/dashboard" className="bottom-nav-item">
      <Home className="w-6 h-6" />
      <span className="text-xs">Home</span>
    </Link>
    <Link to="/profile" className="bottom-nav-item">
      <User className="w-6 h-6" />
      <span className="text-xs">Profile</span>
    </Link>
    <Link to="/products/add" className="bottom-nav-item">
      <Plus className="w-6 h-6" />
      <span className="text-xs">Add</span>
    </Link>
    <Link to="/notifications" className="bottom-nav-item">
      <Bell className="w-6 h-6" />
      <span className="text-xs">Notifications</span>
    </Link>
  </div>
);

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto bg-white min-h-screen animate-fade-in">
        <header className="px-6 pt-8 pb-6">
          <div className="flex justify-between items-center mb-1">
            <div>
              <img 
                src="/lovable-uploads/80bc1318-c22c-43b3-af42-fd1154788e4b.png" 
                alt="WiseBite" 
                className="h-8 mb-1"
              />
              <p className="text-gray-500">Welcome, Saffire</p>
            </div>
            <Avatar className="h-10 w-10">
              <AvatarImage src="/lovable-uploads/eb1f48af-1886-47c2-a56a-96d580f7e040.png" />
              <AvatarFallback>S</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="px-6">
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Quick Access</h2>
            <div className="grid grid-cols-2 gap-4">
              <QuickAccessItem icon={Home} label="KPI" to="/kpi" />
              <QuickAccessItem icon={Users} label="Users" to="/users" />
              <QuickAccessItem icon={ShoppingCart} label="Products" to="/products" />
              <QuickAccessItem icon={ShoppingCart} label="Orders" to="/orders" />
              <QuickAccessItem icon={BarChart} label="Sales" to="/sales" />
              <QuickAccessItem icon={Bell} label="Notifications" to="/notifications" />
              <QuickAccessItem icon={Heart} label="Wishlist" to="/wishlist" />
              <QuickAccessItem icon={Package} label="Parcel" to="/parcel" />
            </div>
          </section>

          <section className="grid grid-cols-2 gap-4 mb-8">
            <StatCard label="Total Sales" value="$12,845" trend="12.5%" />
            <StatCard label="Active Users" value="8,247" trend="18.2%" />
            <StatCard label="New Orders" value="284" trend="8.1%" />
            <StatCard label="Revenue" value="$32,459" trend="22.3%" />
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-2">
              <RecentActivityItem
                title="New order received"
                time="2 minutes ago"
                amount="$128.99"
              />
              <RecentActivityItem
                title="Payment completed"
                time="15 minutes ago"
                amount="$1,200.00"
              />
              <RecentActivityItem
                title="New user registered"
                time="1 hour ago"
              />
            </div>
          </section>
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

export default Dashboard;
