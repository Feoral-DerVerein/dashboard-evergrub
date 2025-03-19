
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
        <DialogTitle className="text-center font-bold text-xl">Order Details</DialogTitle>
        {selectedOrder && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-gray-500 font-medium">Order ID:</div>
              <div className="font-medium">{selectedOrder.id.substring(0, 8)}</div>
              
              <div className="text-gray-500 font-medium">Cliente:</div>
              <div>{selectedOrder.customerName || "Cliente"}</div>
              
              <div className="text-gray-500 font-medium">Total:</div>
              <div className="font-semibold">${selectedOrder.total.toFixed(2)}</div>
              
              <div className="text-gray-500 font-medium">Estado:</div>
              <div className="capitalize font-medium">
                {selectedOrder.status === "pending" && "Por aceptar"}
                {selectedOrder.status === "accepted" && "Aceptado"}
                {selectedOrder.status === "completed" && "Completado"}
                {selectedOrder.status === "rejected" && "Rechazado"}
              </div>
              
              <div className="text-gray-500 font-medium">Ubicación:</div>
              <div>{selectedOrder.location || "N/A"}</div>
              
              <div className="text-gray-500 font-medium">Teléfono:</div>
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
                <h3 className="font-semibold mb-2 text-lg">Petición Especial:</h3>
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-500";
      case "accepted": return "bg-blue-500";
      case "completed": return "bg-emerald-500";
      case "rejected": return "bg-red-500";
      default: return "bg-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Package className="h-5 w-5 text-emerald-500" />;
      default:
        return <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}></div>;
    }
  };

  const OrderCard = ({ order }: { order: Order }) => {
    const getStatusBadge = () => {
      switch (order.status) {
        case "pending":
          return <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">Por aceptar</span>;
        case "accepted":
          return <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">Aceptado</span>;
        case "completed":
          return <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium">Completado</span>;
        case "rejected":
          return <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">Rechazado</span>;
        default:
          return <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">{order.status}</span>;
      }
    };

    return (
      <Card className="mb-4 overflow-hidden border-gray-200 hover:shadow-md transition-shadow duration-200">
        <div className={`h-1 w-full ${getStatusColor(order.status)}`}></div>
        <CardContent className="p-0">
          <div className="p-4 pb-2">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg">{order.customerName || "Cliente"}</h3>
                <p className="text-sm text-gray-500">ID: {order.id.substring(0, 8)}</p>
              </div>
              <div className="flex items-center">
                {getStatusBadge()}
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
            <div className="text-sm">
              {order.items.slice(0, 3).map((item, i) => (
                <p key={i} className="truncate py-0.5">
                  <span className="font-medium">{item.quantity}x</span> {item.name}
                </p>
              ))}
              {order.items.length > 3 && (
                <p className="text-gray-500 italic text-xs mt-1">
                  +{order.items.length - 3} more items
                </p>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center p-4 bg-white">
            <span className="font-bold text-lg">${order.total.toFixed(2)}</span>
            
            <div className="space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleViewDetails(order)}
                className="border-gray-200 hover:bg-gray-50"
              >
                Detalles
              </Button>
              
              {order.status === "pending" && (
                <>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => handleStatusChange(order.id, "accepted")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Aceptar
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleStatusChange(order.id, "rejected")}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Rechazar
                  </Button>
                </>
              )}
              
              {order.status === "accepted" && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => handleStatusChange(order.id, "completed")}
                >
                  Completar
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
        <header className="px-6 pt-8 pb-6 sticky top-0 bg-white z-10 border-b">
          <div className="flex items-center justify-between gap-3 mb-6">
            <h1 className="text-2xl font-bold">Pedidos</h1>
            <div className="flex gap-2 bg-gray-100 p-1 rounded-md">
              <Button 
                variant={viewMode === "cards" ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setViewMode("cards")}
                className={viewMode === "cards" ? "" : "bg-transparent text-gray-700"}
              >
                Tarjetas
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm" 
                onClick={() => setViewMode("table")}
                className={viewMode === "table" ? "" : "bg-transparent text-gray-700"}
              >
                <LayoutDashboard className="h-4 w-4 mr-1" />
                Tabla
              </Button>
            </div>
          </div>
          <p className="text-gray-500">
            {isLoading ? "Cargando pedidos..." : `${orders.length} Pedidos`}
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
              <p className="text-gray-500 font-medium mb-2">No se encontraron pedidos</p>
              <p className="text-gray-400 text-sm max-w-xs">
                Los nuevos pedidos aparecerán aquí cuando los clientes realicen compras.
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
