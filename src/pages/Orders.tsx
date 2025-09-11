import { useState, useEffect } from "react";
import { LayoutDashboard, Package, Eye, Check, X, CheckCircle2, ShoppingBag, Clock, User, Store, CreditCard } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { BottomNav } from "@/components/Dashboard";
import { Order } from "@/types/order.types";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { OrdersTable } from "@/components/orders/OrdersTable";
import * as orderService from "@/services/orderService";
import { useNotificationsAndOrders } from "@/hooks/useNotificationsAndOrders";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { notificationService } from "@/services/notificationService";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
const Orders = () => {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("marketplace");
  const {
    user
  } = useAuth();
  const {
    lastOrderUpdate,
    lastOrderDelete
  } = useNotificationsAndOrders();
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Updated customer names array to match OrdersTable
  const customerNames = ["Lachlan", "Matilda", "Darcy", "Evie", "Banjo", "Sienna", "Kieran", "Indi", "Heath", "Talia", "Jarrah"];
  const getCustomerName = (orderId: string) => {
    const lastChar = orderId.charAt(orderId.length - 1);
    const index = parseInt(lastChar, 16) % customerNames.length;
    return customerNames[index];
  };
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const fetchedOrders = await orderService.getUserOrders();
      console.log("Fetched orders:", fetchedOrders);
      const filteredOrders = fetchedOrders.filter(order => order.status !== "completed");
      setOrders(filteredOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter orders by source - using from_orders_page to distinguish POS vs Marketplace
  const posOrders = orders.filter(order => 
    // POS orders are created directly in the system (from_orders_page = true or manual creation)
    order.customerName === "Test Customer" || 
    order.customerName?.includes("test") ||
    order.location === "Loading Deck" ||
    order.location === "Entrance B"
  );
  const marketplaceOrders = orders.filter(order => 
    // Marketplace orders are external orders (surprise bags, external customers)
    !posOrders.includes(order)
  );

  // Set up real-time subscription for orders
  useEffect(() => {
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          console.log('Order changed, refreshing...');
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  useEffect(() => {
    fetchOrders();
  }, [lastOrderUpdate, lastOrderDelete]);
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };
  const handleStatusChange = async (orderId: string, status: "accepted" | "completed" | "rejected") => {
    try {
      setUpdatingOrderId(orderId);
      console.log(`Updating order ${orderId} to status ${status}`);
      const result = await orderService.updateOrderStatus(orderId, status, true);
      console.log("Update result:", result);
      if (!result.success) {
        throw new Error(result.error?.message || "Unknown error");
      }
      if (status === "completed") {
        const completedOrder = orders.find(order => order.id === orderId);
        const orderTotal = completedOrder?.total || 0;
        setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
        try {
          await notificationService.createSalesNotification(orderId, orderTotal);
          console.log("Sales notification created successfully");
        } catch (notifError) {
          console.error("Error creating sales notification:", notifError);
        }
        toast.success(`Order completed`, {
          description: `The order for $${orderTotal.toFixed(2)} has been recorded as a sale.`
        });
        setTimeout(() => {
          navigate('/sales');
        }, 1500);
      } else if (status === "accepted") {
        setOrders(prevOrders => prevOrders.map(order => order.id === orderId ? {
          ...order,
          status
        } : order));
        toast.success(`Order accepted successfully`, {
          description: "The order has been added to your product sales.",
          duration: 5000,
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />
        });
      } else if (status === "rejected") {
        setOrders(prevOrders => prevOrders.map(order => order.id === orderId ? {
          ...order,
          status
        } : order));
        toast.error(`Order rejected`);
      }
    } catch (error) {
      console.error(`Error updating order status to ${status}:`, error);
      toast.error(`Failed to update order status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUpdatingOrderId(null);
    }
  };
  const handleAcceptOrder = async (orderId: string) => {
    try {
      setUpdatingOrderId(orderId);
      await orderService.updateOrderStatus(orderId, "accepted", true);
      toast.success("Order accepted", {
        description: "The order has been accepted successfully."
      });
      fetchOrders();
    } catch (error) {
      console.error("Error accepting order:", error);
      toast.error("Could not accept the order.", {
        description: "An error occurred while processing the order."
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };
  const navigateToSales = () => {
    navigate('/sales');
  };
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "accepted":
        return "Accepted";
      case "completed":
        return "Completed";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "accepted":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "completed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-3.5 w-3.5 mr-1" />;
      case "accepted":
        return <CheckCircle2 className="h-3.5 w-3.5 mr-1" />;
      case "completed":
        return <Package className="h-3.5 w-3.5 mr-1" />;
      case "rejected":
        return <X className="h-3.5 w-3.5 mr-1" />;
      default:
        return null;
    }
  };
  const OrderDetailsDialog = () => <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="text-center font-bold text-xl">Order Details</DialogTitle>
        {selectedOrder && <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-gray-500 font-medium">Order ID:</div>
              <div className="font-medium">{selectedOrder.id.substring(0, 8)}</div>
              
              <div className="text-gray-500 font-medium">Customer:</div>
              <div>{getCustomerName(selectedOrder.id)}</div>
              
              <div className="text-gray-500 font-medium">Total:</div>
              <div className="font-semibold">${selectedOrder.total.toFixed(2)}</div>
              
              <div className="text-gray-500 font-medium">Status:</div>
              <div className="capitalize font-medium">
                <Badge className={`${getStatusColor(selectedOrder.status)} flex w-fit items-center`}>
                  {getStatusIcon(selectedOrder.status)}
                  {getStatusLabel(selectedOrder.status)}
                </Badge>
              </div>
              
              <div className="text-gray-500 font-medium">Location:</div>
              <div>{selectedOrder.location || "N/A"}</div>
              
              <div className="text-gray-500 font-medium">Phone:</div>
              <div>{selectedOrder.phone || "N/A"}</div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3 text-lg">Items:</h3>
              <div className="space-y-3 bg-gray-50 p-3 rounded-md">
                {selectedOrder.items.map((item, index) => <div key={item.id || index} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                    <span className="font-medium">{item.quantity}x {item.name}</span>
                    <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>)}
              </div>
            </div>
            
            {selectedOrder.specialRequest && <div className="border-t pt-4">
                <h3 className="font-semibold mb-2 text-lg">Special Request:</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-md italic">
                  "{selectedOrder.specialRequest}"
                </p>
              </div>}
          </div>}
      </DialogContent>
    </Dialog>;
  const OrderCard = ({
    order
  }: {
    order: Order;
  }) => {
    const getInitials = (name: string) => {
      return name ? name.substr(0, 2).toUpperCase() : 'CU';
    };
    const customerName = getCustomerName(order.id);
    return <Card className="mb-4 overflow-hidden glass-card-hover transition-all duration-200">
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-mono text-gray-500">#{order.id.substring(0, 8)}</span>
              </div>
              <Badge className={`${getStatusColor(order.status)} flex items-center`}>
                {getStatusIcon(order.status)}
                {getStatusLabel(order.status)}
              </Badge>
            </div>
            
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 bg-blue-100 text-blue-600">
                  <AvatarFallback>{getInitials(customerName)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-base">{customerName}</h3>
                  <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                    <Package className="h-3.5 w-3.5" />
                    <span>{order.items.length} items</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1 font-medium">
                    {order.status === "completed" ? "Paid" : "Pay in person"}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-lg text-emerald-700">${order.total.toFixed(2)}</div>
                <div className="text-xs text-gray-500 mt-1">{order.timestamp}</div>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-0 flex border-t border-gray-100">
          <Button variant="ghost" className="flex-1 rounded-none h-11 border-r border-gray-100 hover:bg-gray-50 text-blue-600" onClick={() => handleViewDetails(order)}>
            <Eye className="h-4 w-4 mr-2" />
            Details
          </Button>
          
          {order.status === "pending" && <>
              <Button variant="ghost" className="flex-1 rounded-none h-11 border-r border-gray-100 hover:bg-gray-50 text-emerald-600" disabled={updatingOrderId === order.id} onClick={() => handleStatusChange(order.id, "accepted")}>
                <Check className="h-4 w-4 mr-2" />
                Accept
              </Button>
              <Button variant="ghost" className="flex-1 rounded-none h-11 hover:bg-gray-50 text-red-600" disabled={updatingOrderId === order.id} onClick={() => handleStatusChange(order.id, "rejected")}>
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </>}
          
          {order.status === "accepted" && <Button variant="ghost" className="flex-1 rounded-none h-11 hover:bg-gray-50 text-emerald-600" disabled={updatingOrderId === order.id} onClick={() => handleStatusChange(order.id, "completed")}>
              <Package className="h-4 w-4 mr-2" />
              Complete
            </Button>}
        </CardFooter>
      </Card>;
  };
  const renderOrdersList = (ordersList: Order[], emptyMessage: string) => {
    if (ordersList.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="h-16 w-16 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium mb-2">No orders found</p>
          <p className="text-gray-400 text-sm max-w-xs">{emptyMessage}</p>
        </div>
      );
    }

    return viewMode === "cards" ? (
      <div className="space-y-4">
        {ordersList.map(order => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    ) : (
      <OrdersTable
        orders={ordersList}
        onViewDetails={handleViewDetails}
        onStatusChange={handleStatusChange}
      />
    );
  };

  return (
    <>
      <header className="px-6 pt-8 pb-6 sticky top-0 glass-card z-10 border-b">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl font-bold">Orders</h1>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-gray-500">
            {isLoading ? "Loading orders..." : `${orders.length} Total Orders`}
          </p>
        </div>
      </header>

      <main className="px-6 py-4">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="marketplace" className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                Marketplace ({marketplaceOrders.length})
              </TabsTrigger>
              <TabsTrigger value="pos" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                POS System ({posOrders.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="marketplace">
              {renderOrdersList(
                marketplaceOrders,
                "No marketplace orders yet. Orders from external customers will appear here."
              )}
            </TabsContent>
            
            <TabsContent value="pos">
              {renderOrdersList(
                posOrders,
                "No POS orders yet. Orders created directly in your system will appear here."
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>

      <OrderDetailsDialog />
      <BottomNav />
    </>
  );
};
export default Orders;