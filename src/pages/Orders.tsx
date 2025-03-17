import { useState, useEffect } from "react";
import { Eye, X, Printer, MapPin, Phone, LayoutDashboard } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { BottomNav } from "@/components/Dashboard";
import { orderService } from "@/services/orderService";
import { Order, OrderItem } from "@/types/order.types";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { OrdersTable } from "@/components/orders/OrdersTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const OrderCard = ({ order, onViewDetails }: { order: Order; onViewDetails: (order: Order) => void }) => {
  const initials = order.customerName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
      <div className="flex items-center justify-between">
        <div className="font-medium text-gray-600">{order.id.substring(0, 8)}</div>
        <div className={`text-sm ${
          order.status === "completed" ? "text-green-500" : 
          order.status === "pending" ? "text-orange-500" : "text-blue-500"
        }`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </div>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            {order.customerImage !== "/placeholder.svg" ? (
              <AvatarImage src={order.customerImage} alt={order.customerName} />
            ) : (
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <p className="font-medium">{order.customerName}</p>
            <p className="text-sm text-gray-500">{order.items.length} items</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-medium">${order.total.toFixed(2)}</p>
            <p className="text-sm text-gray-500">{order.timestamp}</p>
          </div>
          <button onClick={() => onViewDetails(order)} className="text-blue-500">
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const OrderDetailsModal = ({ order, isOpen, onClose }: { order: Order | null; isOpen: boolean; onClose: () => void }) => {
  const { toast } = useToast();
  
  if (!order) return null;

  const initials = order.customerName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
    
  const handleUpdateStatus = async (newStatus: "pending" | "accepted" | "completed" | "rejected") => {
    try {
      await orderService.updateOrderStatus(order.id, newStatus);
      toast({
        title: "Order status updated",
        description: `Order is now ${newStatus}`,
      });
      onClose(); // Close modal after successful update
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Status update failed",
        description: "Could not update the order status",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onClose} className="text-gray-500">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold">Order Details</h2>
          <button className="text-gray-500">
            <Printer className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <div className="text-gray-600">Order ID</div>
              <Badge 
                variant={
                  order.status === "completed" ? "success" : 
                  order.status === "pending" ? "warning" : 
                  order.status === "rejected" ? "destructive" : "info"
                }
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
            <div className="font-semibold">{order.id.substring(0, 8)}</div>
          </div>

          {order.status !== "completed" && order.status !== "rejected" && (
            <div className="flex gap-2 justify-end">
              {order.status === "pending" && (
                <>
                  <Button 
                    onClick={() => handleUpdateStatus("accepted")}
                    variant="default"
                  >
                    Accept Order
                  </Button>
                  <Button 
                    onClick={() => handleUpdateStatus("rejected")}
                    variant="destructive"
                  >
                    Reject Order
                  </Button>
                </>
              )}
              {order.status === "accepted" && (
                <Button
                  onClick={() => handleUpdateStatus("completed")}
                  variant="default"
                >
                  Mark as Completed
                </Button>
              )}
            </div>
          )}

          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              {order.customerImage !== "/placeholder.svg" ? (
                <AvatarImage src={order.customerImage} alt={order.customerName} />
              ) : (
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className="font-semibold">{order.customerName}</p>
              <p className="text-sm text-gray-500">Regular Customer</p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <MapPin className="w-4 h-4" />
              <span>{order.location}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Phone className="w-4 h-4" />
              <span>{order.phone}</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${item.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">x {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">${order.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Delivery Fee</span>
              <span className="font-medium">$0</span>
            </div>
            <div className="flex justify-between font-semibold text-lg mt-2">
              <span>Total</span>
              <span className="text-blue-600">${order.total.toFixed(2)}</span>
            </div>
          </div>

          {order.specialRequest && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium mb-1">Special Request</p>
              <p className="text-sm text-blue-800">{order.specialRequest}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-white rounded-lg p-4 shadow-sm mb-4">
        <div className="flex justify-between mb-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const Orders = () => {
  const [filter, setFilter] = useState<"all" | "pending" | "accepted" | "completed" | "rejected">("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const { user } = useAuth();
  const { toast } = useToast();

  const loadOrders = async () => {
    if (!user) {
      console.log("Usuario no autenticado");
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const fetchedOrders = await orderService.getUserOrders();
      console.log("Órdenes obtenidas:", fetchedOrders);
      setOrders(fetchedOrders);
    } catch (error) {
      console.error("Error al cargar órdenes:", error);
      toast({
        title: "Error loading orders",
        description: "Could not load orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user]);

  const filteredOrders = orders.filter(
    (order) => filter === "all" || order.status === filter
  );

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
          <p className="text-gray-500 mb-4">Today's Orders</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              className="rounded-full whitespace-nowrap"
              onClick={() => setFilter("all")}
            >
              All Orders
            </Button>
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              size="sm"
              className="rounded-full whitespace-nowrap"
              onClick={() => setFilter("pending")}
            >
              Pending
            </Button>
            <Button
              variant={filter === "accepted" ? "default" : "outline"}
              size="sm"
              className="rounded-full whitespace-nowrap"
              onClick={() => setFilter("accepted")}
            >
              Accepted
            </Button>
            <Button
              variant={filter === "completed" ? "default" : "outline"}
              size="sm"
              className="rounded-full whitespace-nowrap"
              onClick={() => setFilter("completed")}
            >
              Completed
            </Button>
            <Button
              variant={filter === "rejected" ? "default" : "outline"}
              size="sm"
              className="rounded-full whitespace-nowrap"
              onClick={() => setFilter("rejected")}
            >
              Rejected
            </Button>
          </div>
        </header>

        <main className="px-6">
          {loading ? (
            <LoadingSkeleton />
          ) : filteredOrders.length > 0 ? (
            viewMode === "cards" ? (
              filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onViewDetails={(order) => setSelectedOrder(order)}
                />
              ))
            ) : (
              <OrdersTable 
                orders={filteredOrders} 
                onViewDetails={(order) => setSelectedOrder(order)} 
                onStatusChange={loadOrders}
              />
            )
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No orders found</p>
            </div>
          )}
        </main>

        <OrderDetailsModal
          order={selectedOrder}
          isOpen={!!selectedOrder}
          onClose={() => {
            setSelectedOrder(null);
            loadOrders(); // Refresh orders when modal is closed
          }}
        />

        <BottomNav />
      </div>
    </div>
  );
};

export default Orders;
