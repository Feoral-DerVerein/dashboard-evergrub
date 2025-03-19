import { useState, useEffect } from "react";
import { Eye, X, Printer, MapPin, Phone, LayoutDashboard, CheckCircle2, Clock, AlertCircle, XCircle, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { BottomNav } from "@/components/Dashboard";
import { Order } from "@/types/order.types";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrdersTable } from "@/components/orders/OrdersTable";
import { orderService } from "@/services/orderService";
import { useToast } from "@/hooks/use-toast";
import { useNotificationsAndOrders } from "@/hooks/useNotificationsAndOrders";

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed": return "text-green-500";
    case "pending": return "text-orange-500";
    case "accepted": return "text-green-500";
    case "rejected": return "text-red-500";
    default: return "text-gray-500";
  }
};

const OrderCard = ({ order, onViewDetails, onDelete }: { 
  order: Order; 
  onViewDetails: (order: Order) => void;
  onDelete: (orderId: string) => void;
}) => {
  const initials = order.customerName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
    
  const getCardClassName = (status: string) => {
    switch (status) {
      case "accepted":
      case "completed":
        return "bg-green-50";
      default:
        return "bg-white";
    }
  };

  return (
    <div className={`rounded-lg p-4 shadow-sm mb-4 ${getCardClassName(order.status)}`}>
      <div className="flex items-center justify-between">
        <div className="font-medium text-gray-600">{order.id.substring(0, 8)}</div>
        <div className="flex items-center gap-2">
          <div className={`text-sm ${getStatusColor(order.status)}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(order.id);
            }} 
            className="text-red-500 hover:text-red-700"
            title="Delete order"
          >
            <Trash2 className="w-4 h-4" />
          </button>
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
        <div className="text-right">
          <p className="font-medium">${order.total.toFixed(2)}</p>
          <p className="text-sm text-gray-500">{order.timestamp}</p>
          <button onClick={() => onViewDetails(order)} className="text-blue-500">
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const OrderDetailsModal = ({ order, isOpen, onClose, onStatusChange, onDelete }: { 
  order: Order | null; 
  isOpen: boolean; 
  onClose: () => void;
  onStatusChange: (orderId: string, status: "accepted" | "completed" | "rejected") => void;
  onDelete: (orderId: string) => void;
}) => {
  const [localStatus, setLocalStatus] = useState<string | null>(null);
  
  if (!order) return null;

  const initials = order.customerName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
  
  const displayStatus = localStatus || order.status;
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge 
          variant="warning"
          icon={<Clock className="h-3 w-3" />}
        >
          Pending
        </Badge>;
      case "accepted":
        return <Badge 
          variant="info"
          icon={<CheckCircle2 className="h-3 w-3" />}
        >
          Accepted
        </Badge>;
      case "completed":
        return <Badge 
          variant="success"
          icon={<CheckCircle2 className="h-3 w-3" />}
        >
          Completed
        </Badge>;
      case "rejected":
        return <Badge 
          variant="destructive"
          icon={<XCircle className="h-3 w-3" />}
        >
          Rejected
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAccept = () => {
    setLocalStatus("accepted");
    onStatusChange(order.id, "accepted");
  };

  const handleComplete = () => {
    setLocalStatus("completed");
    onStatusChange(order.id, "completed");
  };

  const handleReject = () => {
    setLocalStatus("rejected");
    onStatusChange(order.id, "rejected");
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md mx-auto">
        <DialogTitle className="text-lg font-semibold">Order Details</DialogTitle>
        
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <div className="text-gray-600">Order ID</div>
              {getStatusBadge(displayStatus)}
            </div>
            <div className="font-semibold">{order.id.substring(0, 8)}</div>
          </div>

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

          {displayStatus === "pending" && (
            <div className="flex gap-2">
              <Button 
                className="flex-1" 
                variant="default"
                onClick={handleAccept}
              >
                Accept Order
              </Button>
              <Button 
                className="flex-1" 
                variant="destructive"
                onClick={handleReject}
              >
                Reject
              </Button>
            </div>
          )}
          
          {displayStatus === "accepted" && (
            <Button 
              className="w-full" 
              variant="default"
              onClick={handleComplete}
            >
              Mark as Completed
            </Button>
          )}
          
          <Button 
            className="w-full" 
            variant="ghost"
            onClick={() => {
              onDelete(order.id);
              onClose();
            }}
          >
            <Trash2 className="w-4 h-4 mr-2" /> Delete Order
          </Button>
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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const { user } = useAuth();
  const { toast } = useToast();
  const { lastOrderUpdate, lastOrderDelete } = useNotificationsAndOrders();

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (lastOrderUpdate) {
      const refreshSingleOrder = async () => {
        try {
          console.log(`Actualizando orden específica: ${lastOrderUpdate}`);
          const updatedOrder = await orderService.getOrderById(lastOrderUpdate);
          if (updatedOrder) {
            console.log(`Orden actualizada:`, updatedOrder);
            setOrders(prevOrders => 
              prevOrders.map(order => 
                order.id === lastOrderUpdate ? updatedOrder : order
              )
            );
            
            if (selectedOrder && selectedOrder.id === lastOrderUpdate) {
              setSelectedOrder(updatedOrder);
            }
          }
        } catch (error) {
          console.error("Error refreshing updated order:", error);
        }
      };
      
      refreshSingleOrder();
    }
  }, [lastOrderUpdate, selectedOrder]);
  
  useEffect(() => {
    if (lastOrderDelete) {
      console.log(`Eliminando orden del dashboard: ${lastOrderDelete}`);
      setOrders(prevOrders => prevOrders.filter(order => order.id !== lastOrderDelete));
      
      if (selectedOrder && selectedOrder.id === lastOrderDelete) {
        setSelectedOrder(null);
      }
    }
  }, [lastOrderDelete, selectedOrder]);
  
  const loadOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await orderService.getUserOrders();
      console.log("Loaded orders:", ordersData);
      setOrders(ordersData);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, status: "accepted" | "completed" | "rejected") => {
    try {
      if (status === "rejected") {
        await orderService.deleteOrder(orderId);
        toast({
          title: "Order Rejected",
          description: "The order has been rejected and removed",
        });
        setOrders(orders.filter(o => o.id !== orderId));
        setSelectedOrder(null);
      } else {
        console.log(`Cambiando estado de orden ${orderId} a ${status}`);
        const updatedOrder = await orderService.updateOrderStatus(orderId, status);
        console.log(`Orden actualizada:`, updatedOrder);
        
        toast({
          title: "Order Updated",
          description: `Order has been ${status}`,
        });
        
        setOrders(prevOrders => 
          prevOrders.map(o => o.id === orderId ? updatedOrder : o)
        );
        
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(updatedOrder);
        }
      }
    } catch (error) {
      console.error(`Error ${status === "rejected" ? "rejecting" : "updating"} order:`, error);
      toast({
        title: "Error",
        description: `Failed to ${status === "rejected" ? "reject" : "update"} order`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await orderService.deleteOrder(orderId);
      toast({
        title: "Order Deleted",
        description: "The order has been deleted successfully",
      });
      setOrders(orders.filter(o => o.id !== orderId));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      toast({
        title: "Error",
        description: "Failed to delete order",
        variant: "destructive",
      });
    }
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
          <p className="text-gray-500 mb-4">Today's Orders</p>
        </header>

        <main className="px-6">
          {loading ? (
            <LoadingSkeleton />
          ) : orders.length > 0 ? (
            viewMode === "cards" ? (
              orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onViewDetails={(order) => setSelectedOrder(order)}
                  onDelete={handleDeleteOrder}
                />
              ))
            ) : (
              <OrdersTable 
                orders={orders} 
                onViewDetails={(order) => setSelectedOrder(order)} 
                onStatusChange={(orderId, status) => handleStatusChange(orderId, status)}
                onDelete={handleDeleteOrder}
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
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDeleteOrder}
        />

        <BottomNav />
      </div>
    </div>
  );
};

export default Orders;
