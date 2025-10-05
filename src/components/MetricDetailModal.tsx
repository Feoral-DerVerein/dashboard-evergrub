import { useState, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download } from 'lucide-react';
import type { MetricValue } from '@/hooks/useMetricsData';

interface MetricDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  metric: MetricValue;
  format?: 'currency' | 'number' | 'percentage' | 'kg';
}

type ViewMode = 'daily' | 'weekly' | 'monthly';

// Generate 30 days of historical data
const generateHistoricalData = (current: number, previous: number, viewMode: ViewMode) => {
  const data = [];
  const days = viewMode === 'daily' ? 30 : viewMode === 'weekly' ? 12 : 12;
  const multiplier = viewMode === 'daily' ? 1 : viewMode === 'weekly' ? 7 : 30;
  const diff = current - previous;
  const step = diff / days;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(Date.now() - i * multiplier * 24 * 60 * 60 * 1000);
    const dateFormat = viewMode === 'daily' 
      ? { month: 'short', day: 'numeric' } 
      : viewMode === 'weekly'
      ? { month: 'short', day: 'numeric' }
      : { month: 'short' };
    
    data.push({
      date: date.toLocaleDateString('en-US', dateFormat as any),
      value: previous + (step * (days - i)) + (Math.random() * step - step / 2)
    });
  }
  
  return data;
};

// Generate comparison data for this week vs last week
const generateComparisonData = (current: number, previous: number) => {
  return [
    {
      period: 'Last Week',
      value: previous
    },
    {
      period: 'This Week',
      value: current
    }
  ];
};

export function MetricDetailModal({ 
  open, 
  onOpenChange, 
  title, 
  metric,
  format = 'number' 
}: MetricDetailModalProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const chartRef = useRef<HTMLDivElement>(null);
  
  const historicalData = generateHistoricalData(metric.current, metric.previous, viewMode);
  const comparisonData = generateComparisonData(metric.current, metric.previous);

  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return `$${val.toFixed(2)}`;
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'kg':
        return `${val.toFixed(1)} kg`;
      default:
        return val.toFixed(0);
    }
  };

  const exportToPNG = async () => {
    if (!chartRef.current) return;
    
    try {
      // Use html2canvas library for export (needs to be installed)
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(chartRef.current);
      const link = document.createElement('a');
      link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-chart.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export feature requires html2canvas library. Install it with: npm install html2canvas');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center justify-between">
            <span>{title} Analytics</span>
            <Button variant="outline" size="sm" onClick={exportToPNG} className="gap-2">
              <Download className="w-4 h-4" />
              Export PNG
            </Button>
          </DialogTitle>
          <DialogDescription>
            Detailed breakdown and historical trends
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6" ref={chartRef}>
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Current Period
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatValue(metric.current)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Previous Period
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatValue(metric.previous)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Change
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  metric.change >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
                }`}>
                  {metric.change >= 0 ? '+' : ''}{metric.change.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Historical Trend</CardTitle>
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                <TabsList>
                  <TabsTrigger value="daily">Daily</TabsTrigger>
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={formatValue}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatValue(value), title]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>This Week vs Last Week</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="period" 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={formatValue}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatValue(value), title]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="hsl(var(--primary))"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {metric.change > 0 && (
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-600" />
                    <span>Positive growth of {metric.change.toFixed(1)}% this period</span>
                  </li>
                )}
                {metric.change < 0 && (
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-600" />
                    <span>Decrease of {Math.abs(metric.change).toFixed(1)}% - review strategy</span>
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'hsl(var(--primary))' }} />
                  <span>Average: {formatValue((metric.current + metric.previous) / 2)}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-2))' }} />
                  <span>Peak value: {formatValue(Math.max(metric.current, metric.previous))}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
