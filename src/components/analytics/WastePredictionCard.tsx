import { useState, useEffect } from 'react';
import { HelpTooltip } from '@/components/dashboard/HelpTooltip';
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
          <CardTitle className="flex items-center gap-2">
            Waste Prediction
            <HelpTooltip kpiName="Predicción de Mermas" />
          </CardTitle>
        </div>
        <CardDescription>
          Estimated losses for this week if no action is taken
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Value Alert */}
        <div className="p-6 bg-destructive/10 border-2 border-destructive/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-1">Predicted Waste</p>
              <div className="flex items-baseline gap-3">
                <div>
                  <p className="text-4xl font-bold text-destructive">
                    €{(totalValue * 0.051).toLocaleString('en-EU', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-muted-foreground">EUR</p>
                </div>
                <div className="border-l border-border pl-3">
                  <p className="text-4xl font-bold text-destructive">
                    ${(totalValue * 0.056).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-muted-foreground">USD</p>
                </div>
              </div>
            </div>
            <DollarSign className="h-12 w-12 text-destructive opacity-50" />
          </div>
        </div>

        {/* Trend Chart */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Waste Trend</p>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="wasteGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis
                  dataKey="week"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                  className="text-xs"
                />
                <YAxis
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                  className="text-xs"
                  tickFormatter={(value) => `€${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                  formatter={(value: number) => [`€${value.toFixed(0)} / $${(value * 1.1).toFixed(0)}`, 'Waste']}
                />
                <Bar
                  dataKey="value"
                  fill="url(#wasteGradient)"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
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
                        €{(item.value * 0.051).toFixed(2)} / ${(item.value * 0.056).toFixed(2)}
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
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-primary" />
            Recommendations
          </p>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Reduce French Bread orders by 30% next week</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Create 2-for-1 promotion on dairy products expiring soon</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Donate slow-moving products before expiration date</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Adjust vegetable inventory according to actual demand</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default WastePredictionCard;
