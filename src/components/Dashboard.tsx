import { Home, ShoppingCart, Bell, User, Plus, ShoppingBasket, BarChart3, Megaphone, Heart, Coins, Handshake, Search, Filter, Leaf, Recycle, Truck, Clock, Award, Sparkles, MapPin, Timer, Percent, DollarSign, Settings2, Brain, Settings, Store, RefreshCw, Plug, CreditCard, LogOut, TrendingUp, Package, Target, Database } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Link } from "react-router-dom";
import { useNotificationsAndOrders } from "@/hooks/useNotificationsAndOrders";
import welcomeBanner from "@/assets/welcome-banner.png";
import { useState, useEffect } from "react";
import { salesService, Sale } from "@/services/salesService";
import { getUserOrders } from "@/services/orderService";
import { Order } from "@/types/order.types";
import { format, parseISO } from "date-fns";
import PointsBadge from "./PointsBadge";
import { calculateProductPoints } from "@/utils/pointsCalculator";
import { LogoutButton } from "./LogoutButton";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import { Progress } from "./ui/progress";
import { useSurpriseBags } from "@/hooks/useSurpriseBags";
import { useDashboardData } from "@/hooks/useDashboardData";
import { formatCurrency, formatDateTime } from "@/services/posApiService";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useMetricsData } from "@/hooks/useMetricsData";
import { useSalesMetrics, useSustainabilityMetrics, useCustomerMetrics, useSurpriseBagsMetrics } from "@/hooks/useMetricsApi";
import { MetricCard } from "@/components/MetricCard";
import { MetricDetailModal } from "@/components/MetricDetailModal";
import { MetricsTestPanel } from "@/components/MetricsTestPanel";
import type { MetricValue } from "@/hooks/useMetricsData";
type QuickAccessItemProps = {
  icon: React.ComponentType<{
    className?: string;
  }>;
  label: string;
  to?: string;
  badgeCount?: number;
};
const QuickAccessItem = ({
  icon: Icon,
  label,
  to,
  badgeCount
}: QuickAccessItemProps) => <Link to={to || "/"} className="quick-access-item relative">
    <Icon className="w-6 h-6 text-gray-600 mb-2" />
    <span className="text-sm text-gray-600">{label}</span>
    {badgeCount !== undefined && badgeCount > 0 && <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
        {badgeCount > 99 ? '99+' : badgeCount}
      </div>}
  </Link>;
type StatCardProps = {
  label: string;
  value: string | number;
  trend?: string;
  isLoading?: boolean;
};
const StatCard = ({
  label,
  value,
  trend,
  isLoading = false
}: StatCardProps) => <div className="stat-card">
    <h3 className="text-gray-500 text-sm mb-2">{label}</h3>
    {isLoading ? <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div> : <>
        <p className="text-2xl font-semibold mb-1">{value}</p>
        {trend && <span className="positive-trend">↑ {trend}</span>}
      </>}
  </div>;
type RecentActivityItemProps = {
  title: string;
  time: string;
  amount?: string;
  type?: 'order' | 'payment' | 'user';
  orderItems?: any[];
};
const RecentActivityItem = ({
  title,
  time,
  amount,
  type,
  orderItems
}: RecentActivityItemProps) => <div className="recent-activity-item">
    <div className="flex-1">
      <p className="font-medium text-gray-900">{title}</p>
      <p className="text-sm text-gray-500">{time}</p>
      {orderItems && orderItems.length > 0 && <div className="mt-1 flex flex-wrap gap-1">
          {orderItems.slice(0, 2).map((item, index) => <PointsBadge key={index} price={item.price} size="sm" />)}
          {orderItems.length > 2 && <span className="text-xs text-gray-400">+{orderItems.length - 2} more</span>}
        </div>}
    </div>
    {amount && <span className="font-medium">{amount}</span>}
  </div>;
export const BottomNav = () => {
  return null;
};
const Dashboard = () => {
  const {
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const {
    orderCount,
    notificationCount
  } = useNotificationsAndOrders();
  const {
    surpriseBagCount
  } = useSurpriseBags();
  const {
    metrics,
    isLoading: isLoadingMetrics,
    lastUpdated,
    refreshData,
    isUsingMockData
  } = useDashboardData();
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month">("week");

  // Fetch metrics from API endpoints
  const {
    data: salesData,
    isLoading: isLoadingSales,
    isError: isErrorSales,
    refetch: refetchSales
  } = useSalesMetrics(selectedPeriod);
  const {
    data: sustainabilityData,
    isLoading: isLoadingSustainability,
    isError: isErrorSustainability,
    refetch: refetchSustainability
  } = useSustainabilityMetrics(selectedPeriod);
  const {
    data: customerData,
    isLoading: isLoadingCustomer,
    isError: isErrorCustomer,
    refetch: refetchCustomer
  } = useCustomerMetrics(selectedPeriod);
  const {
    data: surpriseBagsData,
    isLoading: isLoadingSurpriseBags,
    isError: isErrorSurpriseBags,
    refetch: refetchSurpriseBags
  } = useSurpriseBagsMetrics('available', 10);
  const isLoadingLiveMetrics = isLoadingSales || isLoadingSustainability || isLoadingCustomer || isLoadingSurpriseBags;

  // Convert API data to MetricValue format
  const liveMetrics = salesData && sustainabilityData && customerData && surpriseBagsData ? {
    totalSales: {
      current: salesData.current.totalSales,
      previous: salesData.previous.totalSales,
      change: salesData.changes.totalSales,
      currency: 'USD'
    },
    transactions: {
      current: salesData.current.transactions,
      previous: salesData.previous.transactions,
      change: salesData.changes.transactions
    },
    profit: {
      current: salesData.current.profit,
      previous: salesData.previous.profit,
      change: salesData.changes.profit,
      currency: 'USD'
    },
    revenue: {
      current: salesData.current.revenue,
      previous: salesData.previous.revenue,
      change: salesData.changes.revenue,
      currency: 'USD'
    },
    avgOrderValue: {
      current: salesData.current.avgOrderValue,
      previous: salesData.previous.avgOrderValue,
      change: salesData.changes.avgOrderValue,
      currency: 'USD'
    },
    co2Saved: {
      current: sustainabilityData.current.co2Saved,
      previous: sustainabilityData.previous.co2Saved,
      change: sustainabilityData.changes.co2Saved
    },
    wasteReduced: {
      current: sustainabilityData.current.wasteReduced,
      previous: sustainabilityData.previous.wasteReduced,
      change: sustainabilityData.changes.wasteReduced
    },
    foodWasteReduced: {
      current: sustainabilityData.current.foodWasteKg,
      previous: sustainabilityData.previous.foodWasteKg,
      change: sustainabilityData.changes.foodWasteKg
    },
    conversionRate: {
      current: customerData.current.conversionRate,
      previous: customerData.previous.conversionRate,
      change: customerData.changes.conversionRate
    },
    returnRate: {
      current: customerData.current.returnRate,
      previous: customerData.previous.returnRate,
      change: customerData.changes.returnRate
    },
    costSavings: {
      current: customerData.current.avgOrderValue * 0.3,
      previous: customerData.previous.avgOrderValue * 0.3,
      change: 20,
      currency: 'USD'
    },
    activeSurpriseBags: {
      current: surpriseBagsData.summary.activeBags,
      previous: surpriseBagsData.summary.activeBags * 0.8,
      change: 25
    },
    surpriseBagRevenue: {
      current: surpriseBagsData.summary.totalRevenue,
      previous: surpriseBagsData.summary.totalRevenue * 0.8,
      change: 25,
      currency: 'USD'
    },
    operationalSavings: {
      current: salesData.current.profit * 0.2,
      previous: salesData.previous.profit * 0.2,
      change: 15,
      currency: 'USD'
    },
    environmentalImpact: {
      current: sustainabilityData.current.environmentalImpact,
      previous: sustainabilityData.previous.environmentalImpact,
      change: sustainabilityData.changes.environmentalImpact
    },
    foodWastePrevented: {
      current: sustainabilityData.current.foodWasteKg,
      previous: sustainabilityData.previous.foodWasteKg,
      change: sustainabilityData.changes.foodWasteKg
    }
  } : null;

  // Manual refresh all metrics
  const refreshAllMetrics = () => {
    refetchSales();
    refetchSustainability();
    refetchCustomer();
    refetchSurpriseBags();
  };
  const [selectedMetric, setSelectedMetric] = useState<{
    title: string;
    value: MetricValue;
    format: 'currency' | 'number' | 'percentage' | 'kg';
  } | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivityItemProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    activeUsers: 0,
    newOrders: 0,
    totalRevenue: 0,
    totalPoints: 0,
    totalGrains: 0,
    isLoading: true
  });
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const recentSales = await salesService.getSales();
        const totalRevenue = recentSales.reduce((sum, sale) => sum + Number(sale.amount), 0);

        // Calculate total points from sales
        const totalPoints = recentSales.reduce((sum, sale) => {
          if (sale.products && Array.isArray(sale.products)) {
            return sum + sale.products.reduce((productSum: number, product: any) => {
              return productSum + calculateProductPoints(product.price || 0);
            }, 0);
          }
          return sum;
        }, 0);

        // For demo purposes, grains are the same as points earned
        // In a real app, this would come from a user_grains table
        const totalGrains = totalPoints;
        const monthlySummary = await salesService.getMonthlySales();
        const orders = await getUserOrders();
        const pendingOrders = orders.filter(order => order.status === "pending").length;
        setStats({
          totalSales: recentSales.length,
          activeUsers: Math.floor(recentSales.length * 1.5),
          newOrders: pendingOrders || orderCount,
          totalRevenue: totalRevenue,
          totalPoints: totalPoints,
          totalGrains: totalGrains,
          isLoading: false
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setStats(prev => ({
          ...prev,
          isLoading: false
        }));
      }
    };
    fetchStats();
  }, [orderCount]);
  useEffect(() => {
    const fetchRecentActivity = async () => {
      setIsLoading(true);
      try {
        const recentSales = await salesService.getSales();
        const latestSales = recentSales.slice(0, 2);
        const salesActivity = latestSales.map(sale => ({
          title: `Payment completed for ${sale.customer_name}`,
          time: formatTimeAgo(sale.created_at),
          amount: `$${Number(sale.amount).toFixed(2)}`,
          type: 'payment' as const,
          orderItems: sale.products || []
        }));
        const recentOrders = await getUserOrders();
        const latestOrders = recentOrders.filter(order => order.status === "pending").slice(0, 1);
        const ordersActivity = latestOrders.map(order => ({
          title: `New order received`,
          time: formatTimeAgo(order.timestamp),
          amount: `$${order.total.toFixed(2)}`,
          type: 'order' as const
        }));
        const allActivity = [...salesActivity, ...ordersActivity];
        if (allActivity.length > 0) {
          setRecentActivity(allActivity);
        } else {
          setRecentActivity([{
            title: "New order received",
            time: "Just now",
            amount: "$128.99",
            type: 'order'
          }, {
            title: "Payment completed",
            time: "15 minutes ago",
            amount: "$1,200.00",
            type: 'payment'
          }, {
            title: "New user registered",
            time: "1 hour ago",
            type: 'user'
          }]);
        }
      } catch (error) {
        console.error("Error fetching recent activity:", error);
        setRecentActivity([{
          title: "New order received",
          time: "2 minutes ago",
          amount: "$128.99",
          type: 'order'
        }, {
          title: "Payment completed",
          time: "15 minutes ago",
          amount: "$1,200.00",
          type: 'payment'
        }, {
          title: "New user registered",
          time: "1 hour ago",
          type: 'user'
        }]);
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
  return <div className="min-h-screen pb-20 md:pb-0 bg-[url('/lovable-uploads/b20288e6-b6b7-4a03-95cf-99585bbbd6d5.png')] bg-cover bg-center bg-no-repeat bg-fixed">
      <div className="w-full glass-card min-h-screen animate-fade-in">
        <div className="md:grid md:grid-cols-[220px_1fr]">
          {/* Sidebar - desktop only */}
          <aside className="hidden md:flex md:flex-col border-r border-gray-100 bg-gray-50/60 p-4 min-h-screen">
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
                <span>Products</span>
              </Link>
              <Link to="/donate" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700">
                <Heart className="w-4 h-4" />
                <span>Donate</span>
              </Link>
              <Link to="/grains" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700">
                <Coins className="w-4 h-4" />
                <span>Grains</span>
              </Link>
              <Link to="/configuration" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Link>
              <Link to="/api-config" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700">
                <Plug className="w-4 h-4" />
                <span>API Config</span>
              </Link>
              <Link to="/partners" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700">
                <Handshake className="w-4 h-4" />
                <span>Partners</span>
              </Link>
              <Link to="/ai" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-200">
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold">🤖 IA WiseBite</span>
              </Link>
            </nav>
            <div className="mt-auto pt-4 border-t border-gray-100">
              <LogoutButton />
            </div>
          </aside>

          {/* Main content */}
          <div>
            <header className="px-6 pt-8 pb-6">
               <div className="flex justify-between items-center mb-1">
                <div>
                 <img src={welcomeBanner} alt="Welcome message" className="h-16 object-contain" />
                 <p className="text-gray-400 text-sm">Ortega's account</p>
                </div>
                <div className="flex items-center gap-3">
                 {/* Status Badge */}
                 <Badge variant={isUsingMockData ? "secondary" : "default"} className="hidden md:flex items-center gap-1.5">
                   <div className={`w-2 h-2 rounded-full ${isUsingMockData ? 'bg-yellow-500' : 'bg-green-500'}`} />
                   {isUsingMockData ? 'Using sample data' : 'Connected to POS'}
                 </Badge>
                 
                 {/* Refresh Button */}
                 <Button variant="outline" size="sm" onClick={refreshAllMetrics} disabled={isLoadingLiveMetrics} className="gap-2">
                   <RefreshCw className={`w-4 h-4 ${isLoadingLiveMetrics ? 'animate-spin' : ''}`} />
                   <span className="hidden md:inline">Refresh</span>
                 </Button>
                 
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="h-14 w-14 cursor-pointer">
                        <AvatarImage src="/lovable-uploads/81d95ee7-5dc6-4639-b0da-bb02c332b8ea.png" alt="Ortega's logo" className="object-cover" />
                        <AvatarFallback>O</AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link to="/configuration" className="flex items-center gap-2 w-full">
                          <Settings className="h-4 w-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/pos-integrations" className="flex items-center gap-2 w-full">
                          <Plug className="h-4 w-4" />
                          POS Integrations
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/pos-integrations" className="flex items-center gap-2 w-full">
                          <Database className="h-4 w-4" />
                          My Integrations
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/pricing" className="flex items-center gap-2 w-full">
                          <CreditCard className="h-4 w-4" />
                          Pricing
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={async () => {
                      try {
                        await signOut();
                        toast.success("Session closed successfully");
                        navigate("/login");
                      } catch (error) {
                        console.error("Error logging out:", error);
                        toast.error("Error logging out");
                      }
                    }}>
                        <LogOut className="h-4 w-4" />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
               </div>
            </header>

            {/* Main Dashboard Content */}
            <main className="px-6 pb-6">
              <div className="text-center mb-8">
                <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
                  This is your summary for today. Here you can view your key performance indicators, 
                  recent activity, and important metrics to help you manage your coffee shop efficiently.
                </p>
                {lastUpdated && <p className="text-xs text-gray-400 mt-2">
                    Last updated: {formatDateTime(lastUpdated)}
                  </p>}
              </div>
              
              {/* Quick Access Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <QuickAccessItem icon={ShoppingCart} label="Products" to="/products" />
                <QuickAccessItem icon={ShoppingBasket} label="Orders" to="/orders" badgeCount={orderCount} />
                <QuickAccessItem icon={Bell} label="Notifications" to="/notifications" badgeCount={notificationCount} />
                <QuickAccessItem icon={Recycle} label="Surprise Bag" to="/products" badgeCount={surpriseBagCount} />
              </div>

              {/* Live Metrics Section */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Live Business Metrics</h2>
                  <div className="flex gap-2">
                    <Button variant={selectedPeriod === "week" ? "default" : "outline"} size="sm" onClick={() => setSelectedPeriod("week")}>
                      Week
                    </Button>
                    <Button variant={selectedPeriod === "month" ? "default" : "outline"} size="sm" onClick={() => setSelectedPeriod("month")}>
                      Month
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {liveMetrics && <>
                      <MetricCard title="Total Sales" value={liveMetrics.totalSales} icon={<DollarSign className="w-5 h-5" />} isLoading={isLoadingSales} isError={isErrorSales} onRetry={refetchSales} format="currency" onClick={() => setSelectedMetric({
                    title: 'Total Sales',
                    value: liveMetrics.totalSales,
                    format: 'currency'
                  })} />
                      <MetricCard title="Transactions" value={liveMetrics.transactions} icon={<ShoppingCart className="w-5 h-5" />} isLoading={isLoadingSales} isError={isErrorSales} onRetry={refetchSales} onClick={() => setSelectedMetric({
                    title: 'Transactions',
                    value: liveMetrics.transactions,
                    format: 'number'
                  })} />
                      <MetricCard title="Profit" value={liveMetrics.profit} icon={<TrendingUp className="w-5 h-5" />} isLoading={isLoadingSales} isError={isErrorSales} onRetry={refetchSales} format="currency" onClick={() => setSelectedMetric({
                    title: 'Profit',
                    value: liveMetrics.profit,
                    format: 'currency'
                  })} />
                      <MetricCard title="Active Surprise Bags" value={liveMetrics.activeSurpriseBags} icon={<Package className="w-5 h-5" />} isLoading={isLoadingSurpriseBags} isError={isErrorSurpriseBags} onRetry={refetchSurpriseBags} onClick={() => setSelectedMetric({
                    title: 'Active Surprise Bags',
                    value: liveMetrics.activeSurpriseBags,
                    format: 'number'
                  })} />
                    </>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {liveMetrics && <>
                      <MetricCard title="CO₂ Saved" value={liveMetrics.co2Saved} icon={<Leaf className="w-5 h-5" />} isLoading={isLoadingSustainability} isError={isErrorSustainability} onRetry={refetchSustainability} format="kg" onClick={() => setSelectedMetric({
                    title: 'CO₂ Saved',
                    value: liveMetrics.co2Saved,
                    format: 'kg'
                  })} />
                      <MetricCard title="Food Waste Reduced" value={liveMetrics.foodWasteReduced} icon={<Recycle className="w-5 h-5" />} isLoading={isLoadingSustainability} isError={isErrorSustainability} onRetry={refetchSustainability} format="kg" onClick={() => setSelectedMetric({
                    title: 'Food Waste Reduced',
                    value: liveMetrics.foodWasteReduced,
                    format: 'kg'
                  })} />
                      <MetricCard title="Cost Savings" value={liveMetrics.costSavings} icon={<Target className="w-5 h-5" />} isLoading={isLoadingCustomer} isError={isErrorCustomer} onRetry={refetchCustomer} format="currency" onClick={() => setSelectedMetric({
                    title: 'Cost Savings',
                    value: liveMetrics.costSavings,
                    format: 'currency'
                  })} />
                    </>}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <StatCard label="Total Sales (Legacy)" value={metrics ? formatCurrency(metrics.totalSales) : formatCurrency(stats.totalSales)} trend={metrics ? `${metrics.salesChange > 0 ? '+' : ''}${metrics.salesChange.toFixed(1)}%` : "5.2% vs last week"} isLoading={isLoadingMetrics || stats.isLoading} />
                <StatCard label="Revenue" value={metrics ? formatCurrency(metrics.revenue) : `$${stats.totalRevenue.toFixed(2)}`} trend={metrics ? `${metrics.revenueChange > 0 ? '+' : ''}${metrics.revenueChange.toFixed(1)}%` : "12.8% vs last week"} isLoading={isLoadingMetrics || stats.isLoading} />
                <StatCard label="Transactions" value={metrics ? metrics.transactions : stats.activeUsers} trend={metrics ? `${metrics.transactionsChange > 0 ? '+' : ''}${metrics.transactionsChange.toFixed(1)}%` : "3.1% vs last week"} isLoading={isLoadingMetrics || stats.isLoading} />
              </div>

              {/* Metrics Testing Panel - For Development */}
              <div className="mb-8">
                <MetricsTestPanel />
              </div>

              {/* Recent Activity */}
              <div className="apple-card-hover p-6 bg-white backdrop-blur-sm border border-slate-200/50 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-slate-900">Recent Activity</h3>
                <div className="space-y-4">
                  {isLoading ? <div className="space-y-3">
                      {[...Array(3)].map((_, i) => <div key={i} className="flex items-center space-x-4">
                          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-4 flex-1 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                        </div>)}
                    </div> : recentActivity.map((activity, index) => <RecentActivityItem key={index} title={activity.title} time={activity.time} amount={activity.amount} type={activity.type} orderItems={activity.orderItems} />)}
                </div>
              </div>
            </main>

            <BottomNav />
          </div>
        </div>
      </div>

      {/* Metric Detail Modal */}
      {selectedMetric && <MetricDetailModal open={!!selectedMetric} onOpenChange={() => setSelectedMetric(null)} title={selectedMetric.title} metric={selectedMetric.value} format={selectedMetric.format} />}
    </div>;
};
export default Dashboard;