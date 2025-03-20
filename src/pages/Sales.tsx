import { Calendar, ChevronUp, DollarSign, Download, Filter, Search, ShoppingBag, CheckCircle2, Store, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { BottomNav } from "@/components/Dashboard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import CategoryButton from "@/components/sales/CategoryButton";
import ProductSaleItem from "@/components/sales/ProductSaleItem";
import StatCard from "@/components/sales/StatCard";
import { productSalesService, ProductSale } from "@/services/productSalesService";

const Sales = () => {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [todayRevenue, setTodayRevenue] = useState<number>(0);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [productSales, setProductSales] = useState<ProductSale[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [newAcceptedOrderId, setNewAcceptedOrderId] = useState<string | null>(null);
  const [newCompletedOrderId, setNewCompletedOrderId] = useState<string | null>(null);
  const [newCompletedOrderAmount, setNewCompletedOrderAmount] = useState<number | null>(null);
  const [newMarketplaceCompletedOrder, setNewMarketplaceCompletedOrder] = useState<{
    id: string;
    total: number;
  } | null>(null);
  const [newOrdersPageAccepted, setNewOrdersPageAccepted] = useState<{
    id: string;
    total: number;
  } | null>(null);

  const navigate = useNavigate();

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  useEffect(() => {
    fetchOrdersData();
    fetchProductSales();
    const channel = supabase.channel('orders-channel').on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'orders',
      filter: "status=in.(accepted,completed)"
    }, payload => {
      console.log('Order status changed:', payload);
      if (payload.new && payload.new.status === 'accepted') {
        const fromOrdersPage = payload.new.from_orders_page === true;
        setNewAcceptedOrderId(payload.new.id);
        if (fromOrdersPage && payload.new.total) {
          setNewOrdersPageAccepted({
            id: payload.new.id,
            total: payload.new.total
          });
          setTimeout(() => {
            setNewOrdersPageAccepted(null);
          }, 10000);
          toast.success(`Order #${payload.new.id.substring(0, 8)} accepted from Orders`);
        } else {
          setTimeout(() => {
            setNewAcceptedOrderId(null);
          }, 5000);
          toast.success(`Order #${payload.new.id.substring(0, 8)} has been accepted and added to sales.`);
        }
      }
      if (payload.new && payload.new.status === 'completed' && payload.new.total) {
        console.log('Completed order detected:', payload.new);
        setNewCompletedOrderId(payload.new.id);
        setNewCompletedOrderAmount(payload.new.total);
        if (payload.new.user_id === null) {
          setNewMarketplaceCompletedOrder({
            id: payload.new.id,
            total: payload.new.total
          });
          setTimeout(() => {
            setNewMarketplaceCompletedOrder(null);
          }, 10000);
          toast.warning(`Order #${payload.new.id.substring(0, 8)} completed successfully. Sale: $${payload.new.total.toFixed(2)}`);
        } else {
          setTimeout(() => {
            setNewCompletedOrderId(null);
            setNewCompletedOrderAmount(null);
          }, 8000);
          toast.success(`Order #${payload.new.id.substring(0, 8)} completed successfully. Sale: $${payload.new.total.toFixed(2)}`);
        }
      }
      fetchProductSales();
      fetchOrdersData();
    }).on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'order_items'
    }, payload => {
      console.log('New order item added:', payload);
      fetchProductSales();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrdersData = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayFormatted = format(today, "yyyy-MM-dd");
      const {
        data: todayOrders,
        error: todayError
      } = await supabase.from('orders').select('total').gte('timestamp', todayFormatted);
      if (todayError) {
        console.error("Error fetching today's orders:", todayError);
        return;
      }
      const revenue = todayOrders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;
      setTodayRevenue(revenue);

      const {
        count,
        error: countError
      } = await supabase.from('orders').select('*', {
        count: 'exact',
        head: true
      }).eq('status', 'completed');
      if (countError) {
        console.error("Error counting orders:", countError);
        return;
      }
      setTotalOrders(count || 0);
      console.log("Total completed orders:", count);
    } catch (error) {
      console.error("Error in fetchOrdersData:", error);
    }
  };

  const fetchProductSales = async () => {
    setIsLoading(true);
    try {
      const sales = await productSalesService.getProductSales();
      console.log("Fetched product sales:", sales);
      setProductSales(sales);
    } catch (error) {
      console.error("Error fetching product sales:", error);
      toast.error("Failed to load product sales data");
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToOrders = () => {
    navigate('/orders');
  };

  const getCategories = () => {
    const categories = new Set(['All']);
    productSales.forEach(product => {
      if (product.category) {
        categories.add(product.category);
      }
    });
    return Array.from(categories);
  };

  const filteredProducts = activeCategory === "All" ? productSales : productSales.filter(product => product.category === activeCategory);

  return <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen animate-fade-in pb-20">
        <header className="px-6 pt-8 pb-6 sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Products Sales</h1>
              <p className="text-gray-500 text-sm">Daily overview</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <StatCard label="Today's Revenue" value={`$${todayRevenue.toFixed(2)}`} icon={<DollarSign className="w-5 h-5 text-white" />} onClick={navigateToOrders} />
            <StatCard label="Total Orders" value={totalOrders.toString()} icon={<ShoppingBag className="w-5 h-5 text-white" />} onClick={navigateToOrders} />
          </div>

          <div className="flex items-center gap-2 text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg">
            <Calendar className="w-4 h-4 text-gray-500" />
            <div className="flex items-center justify-between w-full">
              <span className="text-sm">Last 7 Days</span>
              <ChevronUp className="w-4 h-4" />
            </div>
          </div>

          <div className="relative mb-6">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input type="text" placeholder="Search products..." className="pl-10 pr-10 py-2 bg-gray-50 border-gray-200 focus-visible:ring-green-500" />
            <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
              <Filter className="w-4 h-4 text-gray-500" />
            </Button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-none">
            {getCategories().map(category => <CategoryButton key={category} label={category} isActive={activeCategory === category} onClick={() => handleCategoryChange(category)} />)}
          </div>
        </header>

        <main className="px-6">
          {newOrdersPageAccepted && <Alert className="mb-4 border-blue-500 bg-blue-50 text-blue-800">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
              <AlertTitle className="text-blue-800 font-semibold">Order accepted from Orders page!</AlertTitle>
              <AlertDescription className="text-blue-700">
                An order has been accepted for ${newOrdersPageAccepted.total.toFixed(2)} 
                <br />
                Order #{newOrdersPageAccepted.id.substring(0, 8)}
              </AlertDescription>
            </Alert>}
          
          {newMarketplaceCompletedOrder && <Alert className="mb-4 border-amber-500 bg-amber-50 text-amber-800">
              <Store className="h-5 w-5 text-amber-600" />
              <AlertTitle className="text-amber-800 font-semibold">Marketplace sale completed!</AlertTitle>
              <AlertDescription className="text-amber-700">
                A new Marketplace sale has been recorded for ${newMarketplaceCompletedOrder.total.toFixed(2)} 
                <br />
                Order #{newMarketplaceCompletedOrder.id.substring(0, 8)}
              </AlertDescription>
            </Alert>}
          
          {newCompletedOrderId && newCompletedOrderAmount !== null && !newMarketplaceCompletedOrder && <Alert className="mb-4 border-green-500 bg-green-50 text-green-800">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <AlertTitle className="text-green-800 font-semibold">Sale completed!</AlertTitle>
              <AlertDescription className="text-green-700">
                A new sale has been recorded for ${newCompletedOrderAmount.toFixed(2)} 
                <br />
                Order #{newCompletedOrderId.substring(0, 8)}
              </AlertDescription>
            </Alert>}
          
          {newAcceptedOrderId && !newOrdersPageAccepted && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 animate-pulse">
              <div className="flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                <div>
                  <p className="font-medium">New order accepted!</p>
                  <p className="text-sm">Sales data has been updated.</p>
                </div>
              </div>
            </div>}
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Product Sales</h2>
            <p className="text-sm text-gray-500">{filteredProducts.length} products</p>
          </div>
          
          {isLoading ? <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div> : filteredProducts.length > 0 ? <div className="space-y-1">
              {filteredProducts.map((product, index) => <ProductSaleItem key={index} {...product} />)}
            </div> : <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Bell className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-800">New sales notification</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    When you complete an order, the sales information will appear here automatically.
                  </p>
                  <Button variant="outline" size="sm" className="mt-3 border-amber-300 text-amber-700 hover:bg-amber-100 hover:text-amber-800" onClick={navigateToOrders}>
                    View pending orders
                  </Button>
                </div>
              </div>
            </div>}

          <Button className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-lg py-3 px-4 flex items-center justify-center gap-2 shadow-md" onClick={navigateToOrders}>
            <ShoppingBag className="w-5 h-5" />
            View Orders
          </Button>
        </main>

        <BottomNav />
      </div>
    </div>;
};

export default Sales;
