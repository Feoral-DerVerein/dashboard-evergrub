import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { predictiveAnalyticsService, WasteItem } from '@/services/predictiveAnalyticsService';
import { AlertTriangle, TrendingDown, DollarSign, Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const WastePredictionCard = () => {
  const [totalValue, setTotalValue] = useState(0);
  const [items, setItems] = useState<WasteItem[]>([]);
  const [trend, setTrend] = useState<Array<{ week: string; value: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const wasteData = await predictiveAnalyticsService.getWastePrediction();
      setTotalValue(wasteData.totalValue);
      setItems(wasteData.items);
      setTrend(wasteData.trend);
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
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    );
  }

  const getCauseBadge = (cause: string) => {
    switch (cause) {
      case 'Próxima caducidad':
        return 'destructive';
      case 'Sobrestock':
        return 'default';
      case 'Baja rotación':
      case 'Baja demanda':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <CardTitle>Waste Prediction</CardTitle>
        </div>
        <CardDescription>
          Estimated losses for this week if no action is taken
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Value Alert */}
        <div className="p-6 bg-destructive/10 border-2 border-destructive/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Predicted Waste</p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold text-destructive">
                  ${totalValue.toLocaleString('es-MX')}
                </p>
                <p className="text-sm text-muted-foreground">MXN</p>
              </div>
            </div>
            <DollarSign className="h-12 w-12 text-destructive opacity-50" />
          </div>
        </div>

        {/* Trend Chart */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">Tendencia de Merma</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="week" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
                formatter={(value: number) => `$${value.toLocaleString('es-MX')}`}
              />
              <Bar
                dataKey="value"
                fill="hsl(var(--destructive))"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Items Breakdown */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">Productos en Riesgo</p>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div
                key={index}
                className="p-4 border border-border rounded-lg space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <p className="font-semibold text-sm">{item.product}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{item.quantity} unidades</span>
                      <span>•</span>
                      <span className="font-semibold text-destructive">
                        ${item.value.toLocaleString('es-MX')} MXN
                      </span>
                    </div>
                  </div>
                  <Badge variant={getCauseBadge(item.cause)}>
                    {item.cause}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-primary" />
            Recomendaciones
          </p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>• Reducir orden de Pan Francés en 30% la próxima semana</li>
            <li>• Crear promoción 2x1 en productos lácteos que vencen pronto</li>
            <li>• Donar productos de baja rotación antes del vencimiento</li>
            <li>• Ajustar inventario de verduras según demanda real</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default WastePredictionCard;
