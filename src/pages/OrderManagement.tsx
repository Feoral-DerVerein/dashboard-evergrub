import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, CheckCircle, Clock, User, ArrowLeft, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ReceivedOrderWithProduct {
  id: string;
  seller_id: string;
  buyer_id: string;
  product_id: number;
  quantity_ordered: number;
  unit_price: number;
  total: number;
  status: string;
  shipping_address: string;
  delivery_method: string;
  order_date: string;
  buyer_notes: string | null;
  seller_notes: string | null;
  customer_name: string;
  customer_image: string;
  // Product information
  product_name: string;
  product_image: string;
  product_category: string;
  pickup_location: string;
  // Buyer information
  buyer_company: string;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800", 
  preparing: "bg-purple-100 text-purple-800",
  ready: "bg-green-100 text-green-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusLabels = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  preparing: "Preparando", 
  ready: "Lista",
  delivered: "Entregada",
  cancelled: "Cancelada",
};

const OrderManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ReceivedOrderWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<ReceivedOrderWithProduct | null>(null);
  const [sellerNotes, setSellerNotes] = useState("");

  useEffect(() => {
    if (user) {
      loadReceivedOrders();
    }
  }, [user]);

  const loadReceivedOrders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get orders where I'm the seller, with product and buyer info
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products:product_id (
            name,
            image,
            category,
            pickup_location
          ),
          buyer_profile:buyer_id (
            id
          )
        `)
        .eq('seller_id', user.id)
        .order('order_date', { ascending: false });

      if (error) throw error;

      // Get company profiles for buyers
      const buyerIds = [...new Set(data?.map(order => order.buyer_id) || [])];
      const { data: companyProfiles } = await supabase
        .from('company_profiles')
        .select('user_id, company_name')
        .in('user_id', buyerIds);

      // Map orders with additional information
      const ordersWithInfo = (data || []).map(order => {
        const product = order.products as any;
        const buyerProfile = companyProfiles?.find(p => p.user_id === order.buyer_id);

        return {
          ...order,
          product_name: product?.name || 'Producto eliminado',
          product_image: product?.image || '/placeholder.svg',
          product_category: product?.category || 'Sin categoría',
          pickup_location: product?.pickup_location || 'Ubicación no disponible',
          buyer_company: buyerProfile?.company_name || 'Comprador',
        };
      });

      setOrders(ordersWithInfo);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Error al cargar las órdenes");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string, notes?: string) => {
    try {
      const updates: any = { status: newStatus };
      if (notes) {
        updates.seller_notes = notes;
      }

      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId);

      if (error) throw error;

      toast.success(`Orden ${statusLabels[newStatus as keyof typeof statusLabels].toLowerCase()}`);
      loadReceivedOrders(); // Refresh orders
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Error al actualizar la orden");
    }
  };

  const getNextAction = (status: string) => {
    switch (status) {
      case 'pending':
        return { action: 'confirmed', label: 'Confirmar', color: 'bg-blue-600 hover:bg-blue-700' };
      case 'confirmed':
        return { action: 'preparing', label: 'Preparando', color: 'bg-purple-600 hover:bg-purple-700' };
      case 'preparing':
        return { action: 'ready', label: 'Lista', color: 'bg-green-600 hover:bg-green-700' };
      case 'ready':
        return { action: 'delivered', label: 'Entregada', color: 'bg-emerald-600 hover:bg-emerald-700' };
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando órdenes recibidas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline" 
            onClick={() => navigate("/kpi")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Órdenes</h1>
            <p className="text-gray-600">Órdenes recibidas como vendedor</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
              <p className="text-sm text-gray-600">Total Órdenes</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">
                {orders.filter(o => o.status === 'pending').length}
              </div>
              <p className="text-sm text-gray-600">Pendientes</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Package className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {orders.filter(o => ['confirmed', 'preparing', 'ready'].includes(o.status)).length}
              </div>
              <p className="text-sm text-gray-600">En Proceso</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {orders.filter(o => o.status === 'delivered').length}
              </div>
              <p className="text-sm text-gray-600">Completadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No has recibido órdenes aún
                </h3>
                <p className="text-gray-600 mb-4">
                  Las órdenes de tus productos aparecerán aquí cuando los compradores las realicen.
                </p>
                <Button asChild>
                  <a href="/add-product">Publicar Productos</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => {
              const nextAction = getNextAction(order.status);
              
              return (
                <Card key={order.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <img
                          src={order.product_image}
                          alt={order.product_name}
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                        <div>
                          <h3 className="font-semibold text-lg">{order.product_name}</h3>
                          <p className="text-sm text-gray-600">{order.product_category}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{order.buyer_company}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <Badge 
                          className={statusColors[order.status as keyof typeof statusColors]}
                        >
                          {statusLabels[order.status as keyof typeof statusLabels]}
                        </Badge>
                        <p className="text-sm text-gray-500 mt-1">
                          {format(new Date(order.order_date), "dd/MM/yyyy HH:mm")}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Cantidad</p>
                        <p className="font-semibold">{order.quantity_ordered} unidades</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Precio Unitario</p>
                        <p className="font-semibold">${order.unit_price}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="font-semibold text-lg text-green-600">${order.total}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Método</p>
                        <p className="font-semibold">{order.delivery_method === 'pickup' ? 'Recogida' : 'Entrega'}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-gray-600">
                        <p><strong>Dirección:</strong> {order.shipping_address}</p>
                        {order.buyer_notes && (
                          <p><strong>Notas del comprador:</strong> {order.buyer_notes}</p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Detalles
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Detalles de la Orden #{selectedOrder?.id.slice(0, 8)}</DialogTitle>
                            </DialogHeader>
                            
                            {selectedOrder && (
                              <div className="space-y-6">
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                  <img
                                    src={selectedOrder.product_image}
                                    alt={selectedOrder.product_name}
                                    className="w-20 h-20 object-cover rounded-lg"
                                  />
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-lg">{selectedOrder.product_name}</h3>
                                    <p className="text-gray-600">{selectedOrder.product_category}</p>
                                    <Badge className={statusColors[selectedOrder.status as keyof typeof statusColors]}>
                                      {statusLabels[selectedOrder.status as keyof typeof statusLabels]}
                                    </Badge>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold mb-2">Información del Pedido</h4>
                                    <div className="space-y-2 text-sm">
                                      <p><strong>Cantidad:</strong> {selectedOrder.quantity_ordered} unidades</p>
                                      <p><strong>Precio Unitario:</strong> ${selectedOrder.unit_price}</p>
                                      <p><strong>Total:</strong> ${selectedOrder.total}</p>
                                      <p><strong>Fecha:</strong> {format(new Date(selectedOrder.order_date), "dd/MM/yyyy HH:mm")}</p>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-semibold mb-2">Información del Comprador</h4>
                                    <div className="space-y-2 text-sm">
                                      <p><strong>Empresa:</strong> {selectedOrder.buyer_company}</p>
                                      <p><strong>Método:</strong> {selectedOrder.delivery_method === 'pickup' ? 'Recogida' : 'Entrega'}</p>
                                    </div>
                                  </div>
                                </div>

                                {selectedOrder.shipping_address && (
                                  <div>
                                    <h4 className="font-semibold mb-2">Dirección de Entrega</h4>
                                    <p className="text-sm bg-gray-50 p-3 rounded">{selectedOrder.shipping_address}</p>
                                  </div>
                                )}

                                {selectedOrder.buyer_notes && (
                                  <div>
                                    <h4 className="font-semibold mb-2">Notas del Comprador</h4>
                                    <p className="text-sm bg-blue-50 p-3 rounded">{selectedOrder.buyer_notes}</p>
                                  </div>
                                )}

                                <div>
                                  <Label htmlFor="seller-notes">Agregar Notas (Opcional)</Label>
                                  <Textarea
                                    id="seller-notes"
                                    value={sellerNotes}
                                    onChange={(e) => setSellerNotes(e.target.value)}
                                    placeholder="Instrucciones adicionales, cambios, etc..."
                                    className="mt-2"
                                  />
                                </div>

                                {getNextAction(selectedOrder.status) && (
                                  <div className="flex gap-3 pt-4 border-t">
                                    <Button 
                                      onClick={() => {
                                        const nextAction = getNextAction(selectedOrder.status);
                                        if (nextAction) {
                                          updateOrderStatus(selectedOrder.id, nextAction.action, sellerNotes || undefined);
                                          setSelectedOrder(null);
                                          setSellerNotes("");
                                        }
                                      }}
                                      className={getNextAction(selectedOrder.status)?.color}
                                    >
                                      {getNextAction(selectedOrder.status)?.label}
                                    </Button>
                                    <Button 
                                      variant="destructive"
                                      onClick={() => {
                                        updateOrderStatus(selectedOrder.id, 'cancelled', 'Orden cancelada por el vendedor');
                                        setSelectedOrder(null);
                                        setSellerNotes("");
                                      }}
                                    >
                                      Cancelar Orden
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {nextAction && (
                          <Button 
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, nextAction.action)}
                            className={nextAction.color}
                          >
                            {nextAction.label}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;