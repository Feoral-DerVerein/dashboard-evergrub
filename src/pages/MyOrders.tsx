import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package, Clock, CheckCircle, X, Eye, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface OrderWithProduct {
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
  expected_delivery: string | null;
  actual_delivery: string | null;
  // Product information
  product_name: string;
  product_image: string;
  product_category: string;
  pickup_location: string;
  // Seller information
  seller_company: string;
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

const MyOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithProduct | null>(null);

  useEffect(() => {
    if (user) {
      loadMyOrders();
    }
  }, [user]);

  const loadMyOrders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get orders where I'm the buyer, with product and seller info
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
          seller_profile:seller_id (
            id
          )
        `)
        .eq('buyer_id', user.id)
        .order('order_date', { ascending: false });

      if (error) throw error;

      // Get company profiles for sellers
      const sellerIds = [...new Set(data?.map(order => order.seller_id) || [])];
      const { data: companyProfiles } = await supabase
        .from('company_profiles')
        .select('user_id, company_name')
        .in('user_id', sellerIds);

      // Map orders with additional information
      const ordersWithInfo = (data || []).map(order => {
        const product = order.products as any;
        const sellerProfile = companyProfiles?.find(p => p.user_id === order.seller_id);

        return {
          ...order,
          product_name: product?.name || 'Producto eliminado',
          product_image: product?.image || '/placeholder.svg',
          product_category: product?.category || 'Sin categoría',
          pickup_location: product?.pickup_location || 'Ubicación no disponible',
          seller_company: sellerProfile?.company_name || 'Vendedor',
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'preparing': return <Package className="w-4 h-4" />;
      case 'ready': return <CheckCircle className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando mis órdenes...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Mis Órdenes</h1>
            <p className="text-gray-600">Órdenes que he realizado como comprador</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <ShoppingCart className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
              <p className="text-sm text-gray-600">Total Órdenes</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">
                {orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)).length}
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

          <Card>
            <CardContent className="p-4 text-center">
              <X className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">
                {orders.filter(o => o.status === 'cancelled').length}
              </div>
              <p className="text-sm text-gray-600">Canceladas</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No has realizado órdenes aún
                </h3>
                <p className="text-gray-600 mb-4">
                  Explora el marketplace para encontrar productos de otros vendedores.
                </p>
                <Button asChild>
                  <a href="/marketplace">Explorar Marketplace</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => (
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
                        <p className="text-sm text-gray-600">
                          Vendedor: <span className="font-medium">{order.seller_company}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <Badge 
                        className={statusColors[order.status as keyof typeof statusColors]}
                      >
                        <div className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          {statusLabels[order.status as keyof typeof statusLabels]}
                        </div>
                      </Badge>
                      <p className="text-sm text-gray-500 mt-1">
                        {format(new Date(order.order_date), "dd/MM/yyyy HH:mm")}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                      <p className="font-semibold text-lg text-blue-600">${order.total}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      <p><strong>Entrega:</strong> {order.pickup_location}</p>
                      {order.shipping_address && (
                        <p><strong>Dirección:</strong> {order.shipping_address}</p>
                      )}
                    </div>

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
                                <h4 className="font-semibold mb-2">Información del Vendedor</h4>
                                <div className="space-y-2 text-sm">
                                  <p><strong>Empresa:</strong> {selectedOrder.seller_company}</p>
                                  <p><strong>Ubicación:</strong> {selectedOrder.pickup_location}</p>
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
                                <h4 className="font-semibold mb-2">Mis Notas</h4>
                                <p className="text-sm bg-blue-50 p-3 rounded">{selectedOrder.buyer_notes}</p>
                              </div>
                            )}

                            {selectedOrder.seller_notes && (
                              <div>
                                <h4 className="font-semibold mb-2">Notas del Vendedor</h4>
                                <p className="text-sm bg-green-50 p-3 rounded">{selectedOrder.seller_notes}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;