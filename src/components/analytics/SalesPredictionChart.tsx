import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { predictiveAnalyticsService, SalesPrediction } from '@/services/predictiveAnalyticsService';
import { TrendingUp, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const SalesPredictionChart = () => {
  const [timeRange, setTimeRange] = useState<'hour' | 'day' | 'week' | 'month'>('day');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [data, setData] = useState<SalesPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const predictions = await predictiveAnalyticsService.getSalesPrediction(
        timeRange,
        productFilter === 'all' ? undefined : productFilter
      );
      setData(predictions);
      setIsLoading(false);
    };
    fetchData();
  }, [timeRange, productFilter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    switch (timeRange) {
      case 'hour':
        return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
      case 'day':
        return date.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' });
      case 'week':
        return `Sem ${Math.ceil(date.getDate() / 7)}`;
      case 'month':
        return date.toLocaleDateString('es-MX', { month: 'short' });
      default:
        return '';
    }
  };

  const chartData = data.map((item) => ({
    date: formatDate(item.date),
    actual: item.actual,
    predicted: item.predicted,
    confidence: item.confidence,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>Sales Prediction</CardTitle>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hour">Hourly</SelectItem>
                <SelectItem value="day">Daily</SelectItem>
                <SelectItem value="week">Weekly</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All products</SelectItem>
                <SelectItem value="bakery">Bakery</SelectItem>
                <SelectItem value="drinks">Drinks</SelectItem>
                <SelectItem value="food">Food</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <CardDescription>
          Predictions based on history, weather, events and seasonality
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[400px] w-full" />
        ) : (
          <div className="p-4 bg-card border border-border rounded-lg">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 10 }}>
                <defs>
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis 
                  dataKey="date" 
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
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: '8px' }}
                  formatter={(value: number, name: string) => [
                    `€${value.toFixed(0)} / $${(value * 1.1).toFixed(0)}`,
                    name
                  ]}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  name="Actual Sales"
                  dot={{ r: 5, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={3}
                  strokeDasharray="8 4"
                  name="Prediction"
                  dot={{ r: 5, fill: 'hsl(var(--chart-2))', strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SalesPredictionChart;
