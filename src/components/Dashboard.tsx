import { Home, ShoppingCart, Bell, User, Plus, ShoppingBasket, BarChart3, Megaphone, Heart, Coins, Handshake, Search, Filter, Leaf, Recycle, Truck, Clock, Award, Sparkles, MapPin, Timer, Percent, DollarSign, Settings2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Link } from "react-router-dom";
import { useNotificationsAndOrders } from "@/hooks/useNotificationsAndOrders";
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
      {orderItems && orderItems.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {orderItems.slice(0, 2).map((item, index) => (
            <PointsBadge key={index} price={item.price} size="sm" />
          ))}
          {orderItems.length > 2 && (
            <span className="text-xs text-gray-400">+{orderItems.length - 2} more</span>
          )}
        </div>
      )}
    </div>
    {amount && <span className="font-medium">{amount}</span>}
  </div>;

export const BottomNav = () => {
  const {
    orderCount,
    notificationCount
  } = useNotificationsAndOrders();
  return <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between md:hidden">
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
        {notificationCount > 0 && <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {notificationCount > 99 ? '99+' : notificationCount}
          </div>}
      </Link>
    </div>;
};

const Dashboard = () => {
  const {
    orderCount,
    notificationCount
  } = useNotificationsAndOrders();
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

  return <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 md:flex md:items-center md:justify-center">
      <div className="max-w-md md:max-w-6xl mx-auto bg-white md:rounded-xl md:shadow-sm md:my-0 min-h-screen md:min-h-0 animate-fade-in">
        <div className="md:grid md:grid-cols-[220px_1fr]">
          {/* Sidebar - desktop only */}
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

          {/* Main content */}
          <div>
            <header className="px-6 pt-8 pb-6">
              <div className="flex justify-between items-center mb-1">
                <div>
                  <img src="/lovable-uploads/25d0c5fc-4ab3-44dd-8e67-5e06c5a81537.png" alt="WiseBite Logo" className="h-9 w-auto mb-0" />
                  <p className="text-gray-500">Welcome, Felipe</p>
                  <p className="text-gray-400 text-sm">Ortega's account</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-12 w-12 cursor-pointer">
                      <AvatarImage src="/lovable-uploads/81d95ee7-5dc6-4639-b0da-bb02c332b8ea.png" alt="Ortega's logo" className="object-cover" />
                      <AvatarFallback>O</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-2 w-full">
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <LogoutButton />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>

            <main className="px-6 md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-2">
                <section className="mb-8">
                  <h2 className="text-lg font-semibold mb-4">Quick Access</h2>
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <QuickAccessItem icon={Home} label="KPI" to="/kpi" />
                    <QuickAccessItem icon={ShoppingCart} label="Products" to="/products" />
                    <QuickAccessItem icon={ShoppingBasket} label="Orders" to="/orders" badgeCount={orderCount} />
                    <QuickAccessItem icon={BarChart3} label="Sales" to="/sales" />
                    <QuickAccessItem icon={Bell} label="Notifications" to="/notifications" badgeCount={notificationCount} />
                    <QuickAccessItem icon={Megaphone} label="Ads" to="/ads" />
                    <QuickAccessItem icon={Heart} label="Donate" to="/donate" />
                    <QuickAccessItem icon={Coins} label="Grains" to="/grains" badgeCount={stats.totalGrains >= 2000 ? 1 : undefined} />
                    <QuickAccessItem icon={Handshake} label="Partner" to="/partners" />
                  </div>
                </section>

                <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <StatCard label="Total Sales" value={stats.isLoading ? "" : stats.totalSales} trend="12.5%" isLoading={stats.isLoading} />
                  <StatCard label="Active Users" value={stats.isLoading ? "" : stats.activeUsers} trend="18.2%" isLoading={stats.isLoading} />
                  <StatCard label="New Orders" value={stats.isLoading ? "" : stats.newOrders} trend="8.1%" isLoading={stats.isLoading} />
                  <StatCard label="Points Earned" value={stats.isLoading ? "" : `${stats.totalPoints.toLocaleString()}`} trend="15.4%" isLoading={stats.isLoading} />
                </section>

                {/* IA Predictiva */}
                <section className="space-y-6">
                  {/* 1. Recomendaciones Inteligentes */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5" /> Recomendaciones Inteligentes</CardTitle>
                      <CardDescription>Basadas en menús, historial de compras, estacionalidad y ubicación</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { name: "Queso Brie 3kg", discount: 40, expires: "4 días", note: "ideal para tabla de entrada", img: "/lovable-uploads/a68c025a-979f-446d-a9be-8bd55b21893c.png", distance: "2.1 km" },
                          { name: "Pan integral 1kg", discount: 35, expires: "3 días", note: "perfecto para menú ejecutivo", img: "/lovable-uploads/7ca491d8-bc84-414f-af99-b02fc25a82d2.png", distance: "1.4 km" },
                          { name: "Frutillas 2kg", discount: 50, expires: "2 días", note: "postres y desayunos", img: "/lovable-uploads/eb1f48af-1886-47c2-a56a-96d580f7e040.png", distance: "3.3 km" },
                        ].map((p, i) => (
                          <div key={i} className="flex items-start gap-3 border rounded-lg p-3">
                            <img src={p.img} alt={p.name} className="w-14 h-14 rounded object-cover" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium">{p.name}</span>
                                <Badge variant="secondary" className="flex items-center gap-1"><Percent className="h-3 w-3" /> {p.discount}% off</Badge>
                                <Badge className="flex items-center gap-1"><Timer className="h-3 w-3" /> expira en {p.expires}</Badge>
                                <Badge className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {p.distance}</Badge>
                              </div>
                              <p className="text-sm text-gray-500 mt-1">{p.note}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 2. Buscador y Filtros Dinámicos */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5" /> Buscador y Filtros</CardTitle>
                      <CardDescription>Refina por categoría, caducidad, productor y precio</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-5 gap-3">
                        <div className="md:col-span-2 flex items-center gap-2">
                          <Search className="h-4 w-4 text-gray-500" />
                          <Input placeholder="Buscar productos..." />
                        </div>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="frutas">Frutas</SelectItem>
                            <SelectItem value="lacteos">Lácteos</SelectItem>
                            <SelectItem value="carnicos">Cárnicos</SelectItem>
                            <SelectItem value="panaderia">Panadería</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Productor" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="organico">Orgánico</SelectItem>
                            <SelectItem value="regional">Regional</SelectItem>
                            <SelectItem value="convencional">Convencional</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-500"><span>Descuento</span><span>0% - 60%</span></div>
                          <Slider defaultValue={[30]} max={60} step={5} />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <div className="flex justify-between text-xs text-gray-500"><span>Caducidad mínima (días)</span><span>0 - 7</span></div>
                          <Slider defaultValue={[3]} max={7} step={1} />
                        </div>
                        <div className="md:col-span-1 flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <Input type="number" placeholder="Precio máx." />
                        </div>
                        <div className="md:col-span-2 flex items-center justify-end gap-2">
                          <Button variant="secondary">Limpiar</Button>
                          <Button>Aplicar filtros</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 3. Inventario en tiempo real */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><ShoppingBasket className="h-5 w-5" /> Inventario disponible</CardTitle>
                      <CardDescription>Visualización estilo marketplace</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {[
                          { name: "Leche orgánica 2L", img: "/lovable-uploads/98afa3c3-7256-419f-afa9-f52821cd6d21.png", price: 3.8, old: 5.2, discount: 27, expires: "2d", distance: "1.2 km" },
                          { name: "Tomate cherry 1kg", img: "/lovable-uploads/3a65a638-e8e8-4a0f-a8c4-cc2693037034.png", price: 4.9, old: 7.0, discount: 30, expires: "3d", distance: "2.6 km" },
                        ].map((p, i) => (
                          <div key={i} className="border rounded-lg p-4 flex gap-4 items-start">
                            <img src={p.img} alt={p.name} className="w-20 h-20 rounded object-cover" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{p.name}</h4>
                                <Badge variant="secondary">{p.discount}%</Badge>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-gray-400 line-through">${'{'}p.old.toFixed(2){'}'}</span>
                                <span className="font-semibold">${'{'}p.price.toFixed(2){'}'}</span>
                                <span className="text-xs text-gray-500">Ahorro {Math.round(((p.old - p.price) / p.old) * 100)}%</span>
                              </div>
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1"><Timer className="h-3 w-3" /> {p.expires}</span>
                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {p.distance}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 4. Órdenes automatizadas */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Settings2 className="h-5 w-5" /> Órdenes automatizadas</CardTitle>
                      <CardDescription>Ideal para chefs y gerentes que quieren ahorrar tiempo</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between rounded-md border p-3">
                        <div>
                          <p className="text-sm">Si hay <span className="font-medium">pan integral</span> a menos de <span className="font-medium">$2/kg</span> con <span className="font-medium">3+ días</span> de vida útil → agregar al carrito automático</p>
                          <p className="text-xs text-gray-500 mt-1">Se evalúa al actualizar inventario y al aplicar filtros</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Inactiva</span>
                          <Switch />
                          <span className="text-xs text-gray-500">Activa</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 5. Impacto generado */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Leaf className="h-5 w-5" /> Impacto generado</CardTitle>
                      <CardDescription>Métricas de sostenibilidad y ahorro</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div className="rounded-md border p-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600"><Recycle className="h-4 w-4" /> Kg de comida salvada</div>
                          <p className="text-2xl font-semibold mt-1">124 kg</p>
                        </div>
                        <div className="rounded-md border p-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600"><Leaf className="h-4 w-4" /> CO₂ evitado</div>
                          <p className="text-2xl font-semibold mt-1">380 kg</p>
                        </div>
                        <div className="rounded-md border p-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600"><DollarSign className="h-4 w-4" /> Dinero ahorrado</div>
                          <p className="text-2xl font-semibold mt-1">${'{'}(stats.totalRevenue * 0.15).toFixed(0){'}'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 6. Módulo logístico */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5" /> Módulo logístico</CardTitle>
                      <CardDescription>Estado de entregas y opciones</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="rounded-md border p-3">
                          <div className="text-sm text-gray-600 flex items-center gap-2"><Clock className="h-4 w-4" /> Hora estimada de entrega</div>
                          <p className="font-medium mt-1">Hoy 16:30 - 18:00</p>
                        </div>
                        <div className="rounded-md border p-3">
                          <div className="text-sm text-gray-600 flex items-center gap-2"><ShoppingBasket className="h-4 w-4" /> Agrupamiento de pedidos</div>
                          <p className="font-medium mt-1">Por proveedor y ruta óptima</p>
                        </div>
                        <div className="rounded-md border p-3 col-span-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary">Recolección local</Badge>
                            <Badge>Envío express</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 7. Recompensas y beneficios */}
                  <Card className="mb-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5" /> Recompensas y beneficios</CardTitle>
                      <CardDescription>Cashback en puntos y nivel de membresía</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid sm:grid-cols-3 gap-4 items-center">
                        <div>
                          <div className="text-sm text-gray-600">Puntos acumulados</div>
                          <p className="text-2xl font-semibold">{stats.totalPoints.toLocaleString()} pts</p>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Nivel</div>
                          <p className="text-xl font-medium">{stats.totalPoints >= 5000 ? 'Oro' : stats.totalPoints >= 2000 ? 'Plata' : 'Bronce'}</p>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Progreso al siguiente nivel</div>
                          <Progress value={Math.min(100, Math.round((stats.totalPoints / (stats.totalPoints < 2000 ? 2000 : stats.totalPoints < 5000 ? 5000 : 10000)) * 100))} />
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-gray-500">Visibilidad como negocio sustentable para marketing</div>
                    </CardContent>
                  </Card>
                </section>
              </div>

              <section className="md:col-span-1">
                <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
                <div className="space-y-2">
                  {isLoading ? <div className="flex items-center justify-center py-6">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
                    </div> : recentActivity.length > 0 ? recentActivity.map((activity, index) => <RecentActivityItem key={index} {...activity} />) : <p className="text-gray-500 text-center py-4">No recent activity to display</p>}
                </div>
              </section>
            </main>

            <BottomNav />
          </div>
        </div>
      </div>
    </div>;
};

export default Dashboard;
