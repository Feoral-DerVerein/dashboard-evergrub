import { useState, useEffect } from 'react';
import { HelpTooltip } from '@/components/dashboard/HelpTooltip';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { pricingEngineService, ProductWithPricing } from '@/services/pricingEngineService';
import { RefreshCw, TrendingUp, TrendingDown, Edit, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const RealtimeMonitoringCard = () => {
  const [products, setProducts] = useState<ProductWithPricing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedProduct, setSelectedProduct] = useState<ProductWithPricing | null>(null);
  const [newPrice, setNewPrice] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      const data = await pricingEngineService.getProductsWithPricing();
      setProducts(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error loading products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    // Setup realtime subscription
    const unsubscribe = pricingEngineService.setupRealtimeSubscription((payload) => {
      setLastUpdate(new Date());
      fetchProducts(); // Refresh data when price changes
    });

    // Auto refresh every 10 seconds
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 10000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const getDaysUntilExpiry = (expirationDate: string) => {
    const expiry = new Date(expirationDate);
    const today = new Date();
    const days = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getPriceChangePercentage = (product: ProductWithPricing) => {
    if (!product.base_price || !product.current_price) return 0;
    return ((product.current_price - product.base_price) / product.base_price) * 100;
  };

  const handleManualPriceChange = async () => {
    if (!selectedProduct || !newPrice) return;

    try {
      const price = parseFloat(newPrice);
      if (isNaN(price) || price <= 0) {
        toast.error('Precio inválido');
        return;
      }

      await pricingEngineService.updateProductPrice(
        selectedProduct.id,
        price,
        'Ajuste manual de precio',
        'manual'
      );

      toast.success('Precio actualizado correctamente');
      setIsDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error updating price:', error);
      toast.error('Error al actualizar precio');
    }
  };

  const getTimeAgo = () => {
    const seconds = Math.floor((new Date().getTime() - lastUpdate.getTime()) / 1000);
    if (seconds < 60) return `hace ${seconds} segundos`;
    const minutes = Math.floor(seconds / 60);
    return `hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary animate-pulse" />
              Monitoreo en Tiempo Real
              <HelpTooltip kpiName="Monitorización en Tiempo Real" />
            </CardTitle>
            <CardDescription>
              Precios actualizados automáticamente
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Última actualización: {getTimeAgo()}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-sm">
                <th className="pb-3 font-semibold">Producto</th>
                <th className="pb-3 font-semibold">Precio Base</th>
                <th className="pb-3 font-semibold">Precio Actual</th>
                <th className="pb-3 font-semibold">Cambio</th>
                <th className="pb-3 font-semibold">Stock</th>
                <th className="pb-3 font-semibold">Días Restantes</th>
                <th className="pb-3 font-semibold">Zona</th>
                <th className="pb-3 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const priceChange = getPriceChangePercentage(product);
                const daysLeft = getDaysUntilExpiry(product.expirationdate);

                return (
                  <tr key={product.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={product.image || '/placeholder.svg'}
                          alt={product.name}
                          className="h-10 w-10 rounded object-cover"
                        />
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">${product.base_price?.toFixed(2) || '0.00'}</td>
                    <td className="py-3 font-semibold">
                      ${product.current_price?.toFixed(2) || product.base_price?.toFixed(2) || '0.00'}
                    </td>
                    <td className="py-3">
                      {priceChange !== 0 && (
                        <Badge
                          variant={priceChange < 0 ? 'default' : 'destructive'}
                          className="flex items-center gap-1 w-fit"
                        >
                          {priceChange < 0 ? (
                            <TrendingDown className="h-3 w-3" />
                          ) : (
                            <TrendingUp className="h-3 w-3" />
                          )}
                          {Math.abs(priceChange).toFixed(1)}%
                        </Badge>
                      )}
                    </td>
                    <td className="py-3">{product.quantity}</td>
                    <td className="py-3">
                      <Badge
                        variant={
                          daysLeft <= 1
                            ? 'destructive'
                            : daysLeft <= 3
                              ? 'default'
                              : 'secondary'
                        }
                      >
                        {daysLeft} días
                      </Badge>
                    </td>
                    <td className="py-3">
                      {product.location_zone || 'Sin asignar'}
                    </td>
                    <td className="py-3">
                      <Dialog open={isDialogOpen && selectedProduct?.id === product.id} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (open) {
                          setSelectedProduct(product);
                          setNewPrice(product.current_price?.toString() || product.base_price?.toString() || '');
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Edit className="h-3 w-3" />
                            Ajustar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Ajustar Precio Manualmente</DialogTitle>
                            <DialogDescription>
                              Producto: {product.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div>
                              <label className="text-sm font-medium">Precio Actual</label>
                              <p className="text-2xl font-bold">
                                ${product.current_price?.toFixed(2) || product.base_price?.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Nuevo Precio</label>
                              <Input
                                type="number"
                                step="0.01"
                                value={newPrice}
                                onChange={(e) => setNewPrice(e.target.value)}
                                placeholder="0.00"
                                className="mt-1"
                              />
                            </div>
                            <Button onClick={handleManualPriceChange} className="w-full">
                              Aplicar Cambio
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {products.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay productos disponibles</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RealtimeMonitoringCard;
