
import { useState, useEffect } from "react";
import { LayoutDashboard, Package } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { BottomNav } from "@/components/Dashboard";
import { Order } from "@/types/order.types";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OrdersTable } from "@/components/orders/OrdersTable";
import { orderService } from "@/services/orderService";
import { useNotificationsAndOrders } from "@/hooks/useNotificationsAndOrders";
import { toast } from "sonner";

const Orders = () => {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { lastOrderUpdate, lastOrderDelete } = useNotificationsAndOrders();

  // Fetch orders when component mounts or when orders are updated/deleted
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const fetchedOrders = await orderService.getUserOrders();
        console.log("Fetched orders:", fetchedOrders);
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [lastOrderUpdate, lastOrderDelete]);

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const handleStatusChange = async (orderId: string, status: "accepted" | "completed" | "rejected") => {
    try {
      const updatedOrder = await orderService.updateOrderStatus(orderId, status);
      
      // Update the order in the local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status } : order
        )
      );
      
      toast.success(`Order ${status} successfully`);
    } catch (error) {
      console.error(`Error updating order status to ${status}:`, error);
      toast.error(`Failed to update order status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const OrderDetailsDialog = () => (
    <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="text-center">Order Details</DialogTitle>
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-gray-500">Order ID:</div>
              <div>{selectedOrder.id.substring(0, 8)}</div>
              
              <div className="text-gray-500">Customer:</div>
              <div>{selectedOrder.customerName}</div>
              
              <div className="text-gray-500">Total:</div>
              <div>${selectedOrder.total.toFixed(2)}</div>
              
              <div className="text-gray-500">Status:</div>
              <div className="capitalize">{selectedOrder.status}</div>
              
              <div className="text-gray-500">Location:</div>
              <div>{selectedOrder.location || "N/A"}</div>
              
              <div className="text-gray-500">Phone:</div>
              <div>{selectedOrder.phone || "N/A"}</div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Items:</h3>
              <div className="space-y-2">
                {selectedOrder.items.map(item => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.quantity}x {item.name}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {selectedOrder.specialRequest && (
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Special Request:</h3>
                <p className="text-gray-700">{selectedOrder.specialRequest}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  const OrderCard = ({ order }: { order: Order }) => {
    return (
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-medium">{order.customerName}</h3>
              <p className="text-sm text-gray-500">ID: {order.id.substring(0, 8)}</p>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">{order.timestamp}</span>
              {order.status === "pending" && (
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              )}
              {order.status === "accepted" && (
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              )}
              {order.status === "completed" && (
                <div className="w-3 h-3 text-green-500">
                  <Package className="h-5 w-5" />
                </div>
              )}
              {order.status === "rejected" && (
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
              )}
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-2 pb-2">
            <div className="text-sm">
              {order.items.slice(0, 2).map((item, i) => (
                <p key={i} className="truncate">
                  {item.quantity}x {item.name}
                </p>
              ))}
              {order.items.length > 2 && (
                <p className="text-gray-500">
                  +{order.items.length - 2} more items
                </p>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
            <span className="font-medium">${order.total.toFixed(2)}</span>
            
            <div className="space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleViewDetails(order)}
              >
                Details
              </Button>
              
              {order.status === "pending" && (
                <>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => handleStatusChange(order.id, "accepted")}
                  >
                    Accept
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleStatusChange(order.id, "rejected")}
                  >
                    Reject
                  </Button>
                </>
              )}
              
              {order.status === "accepted" && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleStatusChange(order.id, "completed")}
                >
                  Complete
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen pb-20">
        <header className="px-6 pt-8 pb-6 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between gap-3 mb-6">
            <h1 className="text-2xl font-bold">Orders</h1>
            <div className="flex gap-2">
              <Button 
                variant={viewMode === "cards" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setViewMode("cards")}
              >
                Cards
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="sm" 
                onClick={() => setViewMode("table")}
              >
                <LayoutDashboard className="h-4 w-4 mr-1" />
                Table
              </Button>
            </div>
          </div>
          <p className="text-gray-500 mb-4">
            {isLoading ? "Loading orders..." : `${orders.length} Orders`}
          </p>
        </header>

        <main className="px-6">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : orders.length > 0 ? (
            viewMode === "cards" ? (
              <div>
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
            <div className="text-center py-10">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No orders found</p>
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
