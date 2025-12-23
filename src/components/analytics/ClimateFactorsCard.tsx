import { useState, useEffect } from 'react';
import { HelpTooltip } from '@/components/dashboard/HelpTooltip';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { predictiveAnalyticsService, ClimateData } from '@/services/predictiveAnalyticsService';
import { Cloud, Thermometer, TrendingUp, Droplets } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ClimateFactorsCard = () => {
  const [data, setData] = useState<ClimateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const climateData = await predictiveAnalyticsService.getClimateData();
      setData(climateData);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  if (isLoading || !data) {
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

  const chartData = data.forecast.map((item) => ({
    date: new Date(item.date).toLocaleDateString('es-MX', { weekday: 'short' }),
    temp: Math.round(item.temp),
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-primary" />
          <CardTitle className="flex items-center gap-2">
            Climate Factors
            <HelpTooltip kpiName="Factores Climáticos" />
          </CardTitle>
        </div>
        <CardDescription>How weather affects your sales</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Temperature */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Thermometer className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Current Temperature</p>
              <p className="text-2xl font-bold">{Math.round(data.temperature)}°C</p>
            </div>
          </div>
        </div>

        {/* Forecast Chart */}
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis className="text-xs" domain={['dataMin - 2', 'dataMax + 2']} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
            />
            <Line
              type="monotone"
              dataKey="temp"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Recommended Products */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">
            Climate-Recommended Products
          </p>
          <div className="space-y-2">
            {data.recommendedProducts.map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.reason}</p>
                </div>
                <Badge variant="secondary">{product.category}</Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClimateFactorsCard;
