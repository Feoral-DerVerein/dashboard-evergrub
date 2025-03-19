import { Home, Users, ShoppingCart, BarChart, Bell, Heart, User, Package, Plus, ShoppingBasket } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type QuickAccessItemProps = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  to?: string;
  badgeCount?: number;
};

const QuickAccessItem = ({ 
  icon: Icon, 
  label, 
  to, 
  badgeCount 
}: QuickAccessItemProps) => (
  <Link to={to || "/"} className="quick-access-item relative">
    <Icon className="w-6 h-6 text-gray-600 mb-2" />
    <span className="text-sm text-gray-600">{label}</span>
    {badgeCount !== undefined && badgeCount > 0 && (
      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
        {badgeCount > 99 ? '99+' : badgeCount}
      </div>
    )}
  </Link>
);

type StatCardProps = {
  label: string;
  value: string;
  trend?: string;
};

const StatCard = ({ label, value, trend }: StatCardProps) => (
  <div className="stat-card">
    <h3 className="text-gray-500 text-sm mb-2">{label}</h3>
    <p className="text-2xl font-semibold mb-1">{value}</p>
    {trend && <span className="positive-trend">↑ {trend}</span>}
  </div>
);

type RecentActivityItemProps = {
  title: string;
  time: string;
  amount?: string;
};

const RecentActivityItem = ({ title, time, amount }: RecentActivityItemProps) => (
  <div className="recent-activity-item">
    <div>
      <p className="font-medium text-gray-900">{title}</p>
      <p className="text-sm text-gray-500">{time}</p>
    </div>
    {amount && <span className="font-medium">{amount}</span>}
  </div>
);

export const BottomNav = () => {
  const [orderCount, setOrderCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const fetchOrderCount = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id')
        .eq('status', 'pending');
      
      if (!error && data) {
        setOrderCount(data.length);
      }
    };

    const fetchNotificationCount = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('id')
        .eq('is_read', false);
      
      if (!error && data) {
        setNotificationCount(data.length);
      } else {
        setNotificationCount(3);
      }
    };

    fetchOrderCount();
    fetchNotificationCount();

    const ordersChannel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchOrderCount()
      )
      .subscribe();

    const notificationsChannel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        () => fetchNotificationCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, []);

  return (
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
      <Link to="/notifications" className="bottom-nav-item relative">
        <Bell className="w-6 h-6" />
        <span className="text-xs">Notifications</span>
        {notificationCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {notificationCount > 99 ? '99+' : notificationCount}
          </div>
        )}
      </Link>
    </div>
  );
};

const Dashboard = () => {
  const [orderCount, setOrderCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const fetchOrderCount = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id')
        .eq('status', 'pending');
      
      if (!error && data) {
        setOrderCount(data.length);
      }
    };

    const fetchNotificationCount = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('id')
        .eq('is_read', false);
      
      if (!error && data) {
        setNotificationCount(data.length);
      } else {
        setNotificationCount(3);
      }
    };

    fetchOrderCount();
    fetchNotificationCount();

    const ordersChannel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchOrderCount()
      )
      .subscribe();

    const notificationsChannel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        () => fetchNotificationCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto bg-white min-h-screen animate-fade-in">
        <header className="px-6 pt-8 pb-6">
          <div className="flex justify-between items-center mb-1">
            <div>
              <img 
                src="/lovable-uploads/a18ff71a-0b3e-4795-a638-dd589a1a82ee.png" 
                alt="WiseBite" 
                className="h-6 w-auto mb-1"
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
              <QuickAccessItem 
                icon={ShoppingBasket} 
                label="Orders" 
                to="/orders" 
                badgeCount={orderCount} 
              />
              <QuickAccessItem icon={BarChart} label="Sales" to="/sales" />
              <QuickAccessItem 
                icon={Bell} 
                label="Notifications" 
                to="/notifications" 
                badgeCount={notificationCount} 
              />
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
