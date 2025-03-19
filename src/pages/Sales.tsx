
import { Bell, Calendar, ChevronUp, DollarSign, Download, Filter, Search, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { BottomNav } from "@/components/Dashboard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";

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
  const navigate = useNavigate();

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  // Fetch orders data and product sales on component mount
  useEffect(() => {
    fetchOrdersData();
    fetchProductSales();
    
    // Set up real-time listener for order status changes
    const channel = supabase
      .channel('orders-channel')
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'orders',
          filter: "status=in.(accepted,completed)"
        },
        (payload) => {
          console.log('Order status changed:', payload);
          // Refresh data when an order is accepted or completed
          fetchProductSales();
          fetchOrdersData();
          toast.success("Order data updated");
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrdersData = async () => {
    try {
      // Get today's date at midnight
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Format date for Supabase query
      const todayFormatted = format(today, "yyyy-MM-dd");
      
      // Query for today's orders
      const { data: todayOrders, error: todayError } = await supabase
        .from('orders')
        .select('total')
        .gte('timestamp', todayFormatted);
      
      if (todayError) {
        console.error("Error fetching today's orders:", todayError);
        return;
      }
      
      // Calculate today's revenue
      const revenue = todayOrders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;
      setTodayRevenue(revenue);
      
      // Get total number of orders (all time)
      const { count, error: countError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error("Error counting orders:", countError);
        return;
      }
      
      setTotalOrders(count || 0);
    } catch (error) {
      console.error("Error in fetchOrdersData:", error);
    }
  };

  const fetchProductSales = async () => {
    setIsLoading(true);
    try {
      const sales = await productSalesService.getProductSales();
      setProductSales(sales);
    } catch (error) {
      console.error("Error fetching product sales:", error);
      toast.error("Failed to load product sales data");
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to Orders page
  const navigateToOrders = () => {
    navigate('/orders');
  };

  // Get unique categories from product sales
  const getCategories = () => {
    const categories = new Set(['All']);
    productSales.forEach(product => {
      if (product.category) {
        categories.add(product.category);
      }
    });
    return Array.from(categories);
  };

  // Filter products by category if needed
  const filteredProducts = activeCategory === "All" 
    ? productSales 
    : productSales.filter(product => product.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen animate-fade-in pb-20">
        <header className="px-6 pt-8 pb-6 sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Products Sales</h1>
              <p className="text-gray-500 text-sm">Daily overview</p>
            </div>
            <div className="relative">
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">3</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <StatCard 
              label="Today's Revenue" 
              value={`$${todayRevenue.toFixed(2)}`} 
              icon={<DollarSign className="w-5 h-5 text-white" />}
              onClick={navigateToOrders}
            />
            <StatCard 
              label="Total Orders" 
              value={totalOrders.toString()} 
              icon={<ShoppingBag className="w-5 h-5 text-white" />}
              onClick={navigateToOrders}
            />
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
            <Input 
              type="text" 
              placeholder="Search products..." 
              className="pl-10 pr-10 py-2 bg-gray-50 border-gray-200 focus-visible:ring-green-500"
            />
            <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
              <Filter className="w-4 h-4 text-gray-500" />
            </Button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-none">
            {getCategories().map(category => (
              <CategoryButton 
                key={category} 
                label={category} 
                isActive={activeCategory === category}
                onClick={() => handleCategoryChange(category)}
              />
            ))}
          </div>
        </header>

        <main className="px-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Product Sales</h2>
            <p className="text-sm text-gray-500">{filteredProducts.length} products</p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="space-y-1">
              {filteredProducts.map((product, index) => (
                <ProductSaleItem key={index} {...product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <ShoppingBag className="w-12 h-12 text-gray-300 mb-2" />
              <p className="text-center">No sales data available yet.<br />Start accepting orders to see sales data.</p>
            </div>
          )}

          <Button 
            className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-lg py-3 px-4 flex items-center justify-center gap-2 shadow-md"
          >
            <Download className="w-5 h-5" />
            Export Data
          </Button>
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

export default Sales;
