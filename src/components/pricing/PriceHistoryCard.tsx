import { useState, useEffect } from 'react';
import { HelpTooltip } from '@/components/dashboard/HelpTooltip';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { pricingEngineService, PriceHistory, ProductWithPricing } from '@/services/pricingEngineService';
import { History, TrendingUp, TrendingDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PriceHistoryCard = () => {
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const [products, setProducts] = useState<ProductWithPricing[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedProductId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [historyData, productsData] = await Promise.all([
        pricingEngineService.getPriceHistory(
          selectedProductId === 'all' ? undefined : parseInt(selectedProductId)
        ),
        pricingEngineService.getProductsWithPricing(),
      ]);
      setHistory(historyData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getChartData = () => {
    if (selectedProductId === 'all' || !selectedProductId) return [];

    const productHistory = history
      .filter((h) => h.product_id.toString() === selectedProductId)
      .sort((a, b) => new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime())
      .slice(-30);

    return productHistory.map((h) => ({
      date: new Date(h.changed_at).toLocaleDateString('es-MX', {
        month: 'short',
        day: 'numeric',
      }),
      price: h.new_price,
    }));
  };

  const getProductName = (productId: number) => {
    return products.find((p) => p.id === productId)?.name || 'Producto desconocido';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = getChartData();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Historial y Análisis
              <HelpTooltip kpiName="Historial de Precios" />
            </CardTitle>
            <CardDescription>
              Evolución de precios y cambios recientes
            </CardDescription>
          </div>
          <Select value={selectedProductId} onValueChange={setSelectedProductId}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los productos</SelectItem>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id.toString()}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Evolution Chart */}
        {selectedProductId !== 'all' && chartData.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">Evolución de Precio (últimos 30 días)</p>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent Changes Table */}
        <div className="space-y-2">
          <p className="text-sm font-semibold">Cambios Recientes</p>
          <div className="space-y-2">
            {history.slice(0, 10).map((item) => {
              const priceChange = item.new_price - item.old_price;
              const isIncrease = priceChange > 0;

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex-1 space-y-1">
                    <p className="font-medium text-sm">
                      {getProductName(item.product_id)}
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">
                        ${item.old_price.toFixed(2)}
                      </span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-semibold text-foreground">
                        ${item.new_price.toFixed(2)}
                      </span>
                      <Badge
                        variant={isIncrease ? 'destructive' : 'default'}
                        className="gap-1"
                      >
                        {isIncrease ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {isIncrease ? '+' : ''}
                        {priceChange.toFixed(2)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.reason}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant={item.changed_by === 'automatic' ? 'secondary' : 'outline'}>
                      {item.changed_by === 'automatic' ? 'Automático' : 'Manual'}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.changed_at).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {history.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay cambios de precio registrados</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PriceHistoryCard;
