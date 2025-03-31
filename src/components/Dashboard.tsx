
import { Home, ShoppingCart, Bell, User, Plus, ShoppingBasket, BarChart3, Megaphone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import { useNotificationsAndOrders } from "@/hooks/useNotificationsAndOrders";
import { useState, useEffect } from "react";
import { salesService, Sale } from "@/services/salesService";
import { getUserOrders } from "@/services/orderService";
import { Order } from "@/types/order.types";
import { format, parseISO } from "date-fns";

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
  type?: 'order' | 'payment' | 'user';
};

const RecentActivityItem = ({ title, time, amount, type }: RecentActivityItemProps) => (
  <div className="recent-activity-item">
    <div>
      <p className="font-medium text-gray-900">{title}</p>
      <p className="text-sm text-gray-500">{time}</p>
    </div>
    {amount && <span className="font-medium">{amount}</span>}
  </div>
);

export const BottomNav = () => {
  const { orderCount, notificationCount } = useNotificationsAndOrders();

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
  const { orderCount, notificationCount } = useNotificationsAndOrders();
  const [recentActivity, setRecentActivity] = useState<RecentActivityItemProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      setIsLoading(true);
      try {
        // Get recent sales
        const recentSales = await salesService.getSales();
        const latestSales = recentSales.slice(0, 2);
        
        // Convert sales to activity items
        const salesActivity = latestSales.map((sale) => ({
          title: `Payment completed for ${sale.customer_name}`,
          time: formatTimeAgo(sale.created_at),
          amount: `$${Number(sale.amount).toFixed(2)}`,
          type: 'payment' as const
        }));
        
        // Get recent orders
        const recentOrders = await getUserOrders();
        const latestOrders = recentOrders.filter(order => order.status === "pending").slice(0, 1);
        
        const ordersActivity = latestOrders.map((order) => ({
          title: `New order received`,
          time: formatTimeAgo(order.timestamp),
          amount: `$${order.total.toFixed(2)}`,
          type: 'order' as const
        }));
        
        // Combine activities
        const allActivity = [...salesActivity, ...ordersActivity];
        
        if (allActivity.length > 0) {
          setRecentActivity(allActivity);
        } else {
          // Fallback to dummy data if no real activity found
          setRecentActivity([
            {
              title: "New order received",
              time: "Just now",
              amount: "$128.99",
              type: 'order'
            },
            {
              title: "Payment completed",
              time: "15 minutes ago",
              amount: "$1,200.00",
              type: 'payment'
            },
            {
              title: "New user registered",
              time: "1 hour ago",
              type: 'user'
            }
          ]);
        }
      } catch (error) {
        console.error("Error fetching recent activity:", error);
        // Fallback to dummy data on error
        setRecentActivity([
          {
            title: "New order received",
            time: "2 minutes ago",
            amount: "$128.99",
            type: 'order'
          },
          {
            title: "Payment completed",
            time: "15 minutes ago",
            amount: "$1,200.00",
            type: 'payment'
          },
          {
            title: "New user registered",
            time: "1 hour ago",
            type: 'user'
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecentActivity();
  }, []);
  
  const formatTimeAgo = (timestamp: string) => {
    try {
      const date = parseISO(timestamp);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) {
        return 'Just now';
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
      } else if (diffInMinutes < 24 * 60) {
        const hours = Math.floor(diffInMinutes / 60);
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
      } else {
        return format(date, 'MMM dd, yyyy');
      }
    } catch (error) {
      return 'Recently';
    }
  };

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
              <p className="text-gray-500">Welcome, Felipe</p>
            </div>
            <Avatar className="h-10 w-10">
              <AvatarImage src="/lovable-uploads/eb1f48af-1886-47c2-a56a-96d580f7e040.png" />
              <AvatarFallback>F</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="px-6">
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Quick Access</h2>
            <div className="grid grid-cols-3 gap-4">
              <QuickAccessItem icon={Home} label="KPI" to="/kpi" />
              <QuickAccessItem icon={ShoppingCart} label="Products" to="/products" />
              <QuickAccessItem 
                icon={ShoppingBasket} 
                label="Orders" 
                to="/orders" 
                badgeCount={orderCount} 
              />
              <QuickAccessItem icon={BarChart3} label="Sales" to="/sales" />
              <QuickAccessItem 
                icon={Bell} 
                label="Notifications" 
                to="/notifications" 
                badgeCount={notificationCount} 
              />
              <QuickAccessItem 
                icon={Megaphone} 
                label="Ads" 
                to="/ads" 
              />
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
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
                </div>
              ) : recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <RecentActivityItem
                    key={index}
                    {...activity}
                  />
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent activity to display</p>
              )}
            </div>
          </section>
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

export default Dashboard;
