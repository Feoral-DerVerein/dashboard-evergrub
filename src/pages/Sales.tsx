
import { Bell, Calendar, ChevronUp, DollarSign, Download, Filter, Search, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { BottomNav } from "@/components/Dashboard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

import CategoryButton from "@/components/sales/CategoryButton";
import ProductSaleItem from "@/components/sales/ProductSaleItem";
import StatCard from "@/components/sales/StatCard";

const Sales = () => {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [todayRevenue, setTodayRevenue] = useState<number>(0);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const navigate = useNavigate();
  
  const productSales = [
    {
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      name: "Organic Sourdough Bread",
      category: "Bakery",
      unitsSold: 48,
      revenue: 240
    },
    {
      image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      name: "Fresh Almond Milk",
      category: "Dairy",
      unitsSold: 36,
      revenue: 180
    },
    {
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      name: "Vegan Protein Bowl",
      category: "Vegan",
      unitsSold: 24,
      revenue: 312
    },
    {
      image: "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      name: "Craft Kombucha",
      category: "Beverages",
      unitsSold: 60,
      revenue: 300
    },
    {
      image: "https://images.unsplash.com/photo-1586buffalo-1459738-5461a7633add?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      name: "Gluten-Free Muffins",
      category: "Bakery",
      unitsSold: 42,
      revenue: 168
    }
  ];

  const categories = ["All", "Bakery", "Dairy", "Vegan", "Beverages"];

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  // Fetch orders data on component mount
  useEffect(() => {
    fetchOrdersData();
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

  // Navigate to Orders page
  const navigateToOrders = () => {
    navigate('/orders');
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
            {categories.map(category => (
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
          
          <div className="space-y-1">
            {filteredProducts.map((product, index) => (
              <ProductSaleItem key={index} {...product} />
            ))}
          </div>

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
