import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { predictiveAnalyticsService, CorrelatedProduct } from '@/services/predictiveAnalyticsService';
import { Network, TrendingUp, ShoppingBag } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const CorrelatedProductsMatrix = () => {
  const [products, setProducts] = useState<CorrelatedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const correlatedData = await predictiveAnalyticsService.getCorrelatedProducts();
      setProducts(correlatedData);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const getCorrelationColor = (correlation: number) => {
    if (correlation > 0.85) return 'text-green-600 dark:text-green-400';
    if (correlation > 0.7) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const getCorrelationBadge = (correlation: number) => {
    if (correlation > 0.85) return 'default';
    if (correlation > 0.7) return 'secondary';
    return 'outline';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-primary" />
          <CardTitle>Productos Correlacionados</CardTitle>
        </div>
        <CardDescription>
          Productos frecuentemente comprados juntos - Crea combos inteligentes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-3">
          {products.map((item, index) => (
            <div
              key={index}
              className="p-4 border border-border rounded-lg space-y-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <ShoppingBag className="h-4 w-4 text-primary flex-shrink-0" />
                  <div className="space-y-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {item.productA} + {item.productB}
                    </p>
                  </div>
                </div>
                <Badge variant={getCorrelationBadge(item.correlation)}>
                  {Math.round(item.correlation * 100)}%
                </Badge>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Frecuencia de compra</p>
                  <p className="font-semibold text-foreground">{item.frequency} veces</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">Correlación</p>
                  <p className={`font-bold ${getCorrelationColor(item.correlation)}`}>
                    {item.correlation.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <p className="text-xs text-primary font-medium">
                  💡 Sugerencia: Crear combo "{item.productA} + {item.productB}"
                </p>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Network className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay correlaciones detectadas aún</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CorrelatedProductsMatrix;
