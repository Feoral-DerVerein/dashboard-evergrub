
import { Calendar, ChevronUp, DollarSign, Filter, Search, ShoppingBag, Package } from "lucide-react";
import { BottomNav } from "@/components/Dashboard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import StatCard from "@/components/sales/StatCard";
import { salesService } from "@/services/salesService";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Order } from "@/types/order.types";
import * as orderService from "@/services/orderService";
import CategoryButton from "@/components/sales/CategoryButton";

const Sales = () => {
  const [todayRevenue, setTodayRevenue] = useState<number>(0);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrdersData();
    fetchPendingOrders();
    
    const channel = supabase.channel('orders-channel').on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'orders',
      filter: "status=in.(accepted,completed,pending)"
    }, payload => {
      console.log('Order status changed:', payload);
      fetchOrdersData();
      fetchPendingOrders();
    }).subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrdersData = async () => {
    try {
      // Get today's revenue
      const { total, count } = await salesService.getTodaySales();
      setTodayRevenue(total);
      
      // Get total completed orders count
      const {
        count: totalCount,
        error: countError
      } = await supabase.from('orders').select('*', {
        count: 'exact',
        head: true
      }).eq('status', 'completed');
      
      if (countError) {
        console.error("Error counting orders:", countError);
        return;
      }
      
      setTotalOrders(totalCount || 0);
    } catch (error) {
      console.error("Error in fetchOrdersData:", error);
    }
  };

  const fetchPendingOrders = async () => {
    setIsLoading(true);
    try {
      const fetchedOrders = await orderService.getUserOrders();
      const filtered = fetchedOrders.filter(order => order.status === "pending");
      setPendingOrders(filtered);
    } catch (error) {
      console.error("Error fetching pending orders:", error);
      toast.error("Failed to load pending orders");
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToOrders = () => {
    navigate('/orders');
  };

  // Helper function to get initials from customer name
  const getInitials = (name: string) => {
    return name ? name.substr(0, 2).toUpperCase() : 'CU';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen animate-fade-in pb-20">
        <header className="px-6 pt-8 pb-6 sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Sales</h1>
              <p className="text-gray-500 text-sm">Daily overview</p>
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
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            >
              <Filter className="w-4 h-4 text-gray-500" />
            </Button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-none">
            <CategoryButton label="All" isActive={true} />
          </div>
        </header>

        <main className="px-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Product Sales</h2>
            <p className="text-sm text-gray-500">{pendingOrders.length} products</p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : pendingOrders.length > 0 ? (
            <div className="space-y-4">
              {pendingOrders.map((order) => (
                <div key={order.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-mono text-gray-600">{order.id.substring(0, 8)}</p>
                      <span className="text-amber-500 font-medium">Pending</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 bg-blue-100 text-blue-500">
                          <AvatarFallback>{getInitials(order.customerName)}</AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <h3 className="font-bold text-xl">{order.customerName}</h3>
                          <p className="text-gray-500">{order.items.length} items</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <div className="font-bold text-xl">${order.total.toFixed(2)}</div>
                        <div className="text-gray-500">{order.timestamp}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
              <p className="text-amber-700">No pending orders found</p>
            </div>
          )}

          <Button 
            className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-lg py-3 px-4 flex items-center justify-center gap-2 shadow-md" 
            onClick={navigateToOrders}
          >
            <Package className="w-5 h-5" />
            View Orders
          </Button>
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

export default Sales;
