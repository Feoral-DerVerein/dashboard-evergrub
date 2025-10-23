import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  Settings,
  Send,
  MapPin,
  Phone,
  User,
  RefreshCw
} from "lucide-react";
import { DeliverectConfigDialog } from "@/components/DeliverectConfigDialog";
import { DeliverectShipmentDialog } from "@/components/DeliverectShipmentDialog";
import { DeliveryPlatformsDialog } from "@/components/DeliveryPlatformsDialog";
import deliverectService from "@/services/deliverectService";
import type { DeliverectOrder, DeliverectDelivery, DeliverectShipment } from "@/services/deliverectService";
import { format } from "date-fns";

export default function DeliverectDashboard() {
  const [configOpen, setConfigOpen] = useState(false);
  const [shipmentOpen, setShipmentOpen] = useState(false);
  const [platformsOpen, setPlatformsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<DeliverectOrder[]>([]);
  const [deliveries, setDeliveries] = useState<DeliverectDelivery[]>([]);
  const [shipments, setShipments] = useState<DeliverectShipment[]>([]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [ordersData, deliveriesData, shipmentsData] = await Promise.all([
        deliverectService.getOrders(),
        deliverectService.getDeliveries(),
        deliverectService.getShipments(),
      ]);

      setOrders(ordersData);
      setDeliveries(deliveriesData);
      setShipments(shipmentsData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      processing: "secondary",
      sent: "default",
      failed: "destructive",
      received: "secondary",
      preparing: "outline",
      ready: "default",
      assigned: "secondary",
      picked_up: "default",
      in_transit: "default",
      delivered: "default",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const stats = [
    {
      title: "Total Shipments",
      value: shipments.length,
      icon: Package,
      description: "Products sent to delivery"
    },
    {
      title: "Active Orders",
      value: orders.filter(o => o.order_status !== 'delivered').length,
      icon: Clock,
      description: "In progress"
    },
    {
      title: "In Transit",
      value: deliveries.filter(d => d.dispatch_status === 'in_transit').length,
      icon: Truck,
      description: "Out for delivery"
    },
    {
      title: "Delivered",
      value: deliveries.filter(d => d.dispatch_status === 'delivered').length,
      icon: CheckCircle,
      description: "Completed deliveries"
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Deliverect Dashboard</h1>
          <p className="text-muted-foreground">
            Manage delivery shipments, orders, and courier dispatch
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPlatformsOpen(true)}>
            <Truck className="mr-2 h-4 w-4" />
            Connect Platforms
          </Button>
          <Button onClick={() => setShipmentOpen(true)}>
            <Send className="mr-2 h-4 w-4" />
            Send Products
          </Button>
          <Button variant="outline" size="icon" onClick={loadAllData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="shipments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="shipments">Shipments</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
        </TabsList>

        {/* Shipments Tab */}
        <TabsContent value="shipments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Shipments</CardTitle>
              <CardDescription>Products sent to delivery platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shipments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No shipments yet. Click "Send Products" to get started.
                  </p>
                ) : (
                  shipments.map((shipment) => (
                    <div
                      key={shipment.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {shipment.total_items} items
                          </span>
                          {getStatusBadge(shipment.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {shipment.platform || "Pending platform assignment"}
                        </p>
                        {shipment.error_message && (
                          <p className="text-sm text-destructive mt-1">
                            {shipment.error_message}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(shipment.created_at!), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Orders</CardTitle>
              <CardDescription>Track customer orders and deliveries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No orders yet
                  </p>
                ) : (
                  orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-start justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Order #{order.deliverect_order_id}</span>
                          {getStatusBadge(order.order_status)}
                        </div>
                        
                        {order.customer_name && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-3 w-3" />
                            {order.customer_name}
                          </div>
                        )}
                        
                        {order.delivery_address && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {order.delivery_address}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Platform:</span>
                          <Badge variant="outline">{order.platform}</Badge>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {order.total_amount && (
                          <p className="font-bold text-lg">${order.total_amount}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(order.created_at!), "MMM dd, HH:mm")}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deliveries Tab */}
        <TabsContent value="deliveries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Courier Dispatch</CardTitle>
              <CardDescription>Track courier assignments and delivery status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deliveries.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No active deliveries
                  </p>
                ) : (
                  deliveries.map((delivery) => (
                    <div
                      key={delivery.id}
                      className="flex items-start justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          {getStatusBadge(delivery.dispatch_status)}
                        </div>
                        
                        {delivery.courier_name && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-3 w-3" />
                              <span className="font-medium">{delivery.courier_name}</span>
                            </div>
                            {delivery.courier_phone && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {delivery.courier_phone}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {delivery.tracking_url && (
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto"
                            onClick={() => window.open(delivery.tracking_url, "_blank")}
                          >
                            Track Delivery
                          </Button>
                        )}
                      </div>
                      
                      <div className="text-right text-sm text-muted-foreground">
                        {delivery.assigned_at && (
                          <p>Assigned: {format(new Date(delivery.assigned_at), "MMM dd, HH:mm")}</p>
                        )}
                        {delivery.picked_up_at && (
                          <p>Picked up: {format(new Date(delivery.picked_up_at), "HH:mm")}</p>
                        )}
                        {delivery.delivered_at && (
                          <p className="text-green-600 font-medium">
                            Delivered: {format(new Date(delivery.delivered_at), "HH:mm")}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <DeliverectConfigDialog open={configOpen} onOpenChange={setConfigOpen} />
      <DeliverectShipmentDialog open={shipmentOpen} onOpenChange={setShipmentOpen} />
      <DeliveryPlatformsDialog open={platformsOpen} onOpenChange={setPlatformsOpen} />
    </div>
  );
}
