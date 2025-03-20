import { useState, useEffect } from "react";
import { LayoutDashboard, Package, Eye, Check, X, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { BottomNav } from "@/components/Dashboard";
import { Order } from "@/types/order.types";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OrdersTable } from "@/components/orders/OrdersTable";
import * as orderService from "@/services/orderService";
import { useNotificationsAndOrders } from "@/hooks/useNotificationsAndOrders";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { lastOrderUpdate, lastOrderDelete } = useNotificationsAndOrders();
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const fetchedOrders = await orderService.getUserOrders();
      console.log("Fetched orders:", fetchedOrders);
      // Filter out completed orders
      const filteredOrders = fetchedOrders.filter(order => order.status !== "completed");
      setOrders(filteredOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

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
      
      // Get the order details before updating the status
      const completedOrder = orders.find(order => order.id === orderId);
      const orderTotal = completedOrder?.total || 0;
      
      // Update the order status
      const result = await orderService.updateOrderStatus(orderId, status, true);
      
      if (!result.success) {
        throw new Error(`Failed to update order status: ${result.error}`);
      }
      
      if (status === "completed") {
        // Remove the completed order from the orders list
        setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
        
        toast({
          title: "Order completed",
          description: `The order for $${orderTotal.toFixed(2)} has been recorded in sales.`,
          variant: "success",
        });
        
        // Navigate to Sales page after a brief delay to show the toast
        setTimeout(() => {
          navigate('/sales');
        }, 1500);
      } else if (status === "accepted") {
        // Update the order status in the UI
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId ? { ...order, status } : order
          )
        );
        toast({
          title: "Order accepted",
          description: "The order has been added to your product sales.",
          variant: "success",
        });
      } else if (status === "rejected") {
        // Update the order status in the UI
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId ? { ...order, status } : order
          )
        );
        toast({
          title: "Order rejected",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error(`Error updating order status to ${status}:`, error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      setUpdatingOrderId(orderId);
      await orderService.updateOrderStatus(orderId, "accepted", true);
      
      toast.success("Orden aceptada", {
        description: "La orden ha sido aceptada exitosamente.",
      });
      
      fetchOrders();
    } catch (error) {
      console.error("Error accepting order:", error);
      toast.error("No se pudo aceptar la orden.", {
        description: "Ha ocurrido un error al procesar la orden.",
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const OrderDetailsDialog = () => (
    <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="text-center font-bold text-xl">Order Details</DialogTitle>
        {selectedOrder && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-gray-500 font-medium">Order ID:</div>
              <div className="font-medium">{selectedOrder.id.substring(0, 8)}</div>
              
              <div className="text-gray-500 font-medium">Customer:</div>
              <div>{selectedOrder.customerName || "Customer"}</div>
              
              <div className="text-gray-500 font-medium">Total:</div>
              <div className="font-semibold">${selectedOrder.total.toFixed(2)}</div>
              
              <div className="text-gray-500 font-medium">Status:</div>
              <div className="capitalize font-medium">
                {selectedOrder.status === "pending" && "Pending"}
                {selectedOrder.status === "accepted" && "Accepted"}
                {selectedOrder.status === "completed" && "Completed"}
                {selectedOrder.status === "rejected" && "Rejected"}
              </div>
              
              <div className="text-gray-500 font-medium">Location:</div>
              <div>{selectedOrder.location || "N/A"}</div>
              
              <div className="text-gray-500 font-medium">Phone:</div>
              <div>{selectedOrder.phone || "N/A"}</div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3 text-lg">Items:</h3>
              <div className="space-y-3 bg-gray-50 p-3 rounded-md">
                {selectedOrder.items.map((item, index) => (
                  <div key={item.id || index} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                    <span className="font-medium">{item.quantity}x {item.name}</span>
                    <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {selectedOrder.specialRequest && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2 text-lg">Special Request:</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-md italic">
                  "{selectedOrder.specialRequest}"
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending": return "Pending";
      case "accepted": return "Accepted";
      case "completed": return "Completed";
      case "rejected": return "Rejected";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "text-amber-500";
      case "accepted": return "text-blue-500";
      case "completed": return "text-emerald-500";
      case "rejected": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  const OrderCard = ({ order }: { order: Order }) => {
    const getInitials = (name: string) => {
      return name ? name.substr(0, 2).toUpperCase() : 'CN';
    };
    
    const formatTime = (timestamp: string) => {
      try {
        return timestamp;
      } catch (error) {
        return "";
      }
    };

    return (
      <Card className="mb-4 border border-gray-200 hover:shadow-sm transition-shadow duration-200 overflow-hidden">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center mb-2">
            <div className="text-gray-600 font-mono">
              {order.id.substring(0, 8)}
            </div>
            <div className={`font-medium ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </div>
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
              <div className="text-gray-500">{formatTime(order.timestamp)}</div>
            </div>
          </div>
        </div>
        
        <div className="flex border-t border-gray-100">
          <Button 
            variant="ghost" 
            className="flex-1 rounded-none h-12 border-r border-gray-100 hover:bg-gray-50"
            onClick={() => handleViewDetails(order)}
          >
            <Eye className="h-5 w-5 text-blue-500" />
          </Button>
          
          {order.status === "pending" && (
            <>
              <Button 
                variant="ghost" 
                className="flex-1 rounded-none h-12 border-r border-gray-100 hover:bg-gray-50"
                onClick={() => handleStatusChange(order.id, "accepted")}
              >
                <Check className="h-5 w-5 text-green-500" />
              </Button>
              <Button 
                variant="ghost" 
                className="flex-1 rounded-none h-12 border-r border-gray-100 hover:bg-gray-50"
                onClick={() => handleStatusChange(order.id, "rejected")}
              >
                <X className="h-5 w-5 text-red-500" />
              </Button>
            </>
          )}
          
          {order.status === "accepted" && (
            <Button 
              variant="ghost" 
              className="flex-1 rounded-none h-12 hover:bg-gray-50"
              onClick={() => handleStatusChange(order.id, "completed")}
            >
              <Package className="h-5 w-5 text-green-500" />
            </Button>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen pb-20">
        <header className="px-6 pt-8 pb-6 sticky top-0 bg-white z-10 border-b">
          <div className="flex items-center justify-between gap-3 mb-6">
            <h1 className="text-2xl font-bold">Orders</h1>
            <div className="flex gap-2 bg-gray-100 p-1 rounded-md">
              <Button 
                variant={viewMode === "cards" ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setViewMode("cards")}
                className={viewMode === "cards" ? "" : "bg-transparent text-gray-700"}
              >
                Cards
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm" 
                onClick={() => setViewMode("table")}
                className={viewMode === "table" ? "" : "bg-transparent text-gray-700"}
              >
                <LayoutDashboard className="h-4 w-4 mr-1" />
                Table
              </Button>
            </div>
          </div>
          <p className="text-gray-500">
            {isLoading ? "Loading orders..." : `${orders.length} Orders`}
          </p>
        </header>

        <main className="px-6 py-4">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : orders.length > 0 ? (
            viewMode === "cards" ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            ) : (
              <OrdersTable 
                orders={orders} 
                onViewDetails={handleViewDetails} 
                onStatusChange={handleStatusChange} 
              />
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium mb-2">No orders found</p>
              <p className="text-gray-400 text-sm max-w-xs">
                New orders will appear here when customers make purchases.
              </p>
            </div>
          )}
        </main>

        <OrderDetailsDialog />
        <BottomNav />
      </div>
    </div>
  );
};

export default Orders;
