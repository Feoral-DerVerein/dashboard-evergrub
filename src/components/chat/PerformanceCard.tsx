import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, DollarSign, Users, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PerformanceCardProps {
  data?: {
    revenue?: number;
    revenueGrowth?: number;
    orders?: number;
    ordersGrowth?: number;
    customers?: number;
    products?: number;
  };
}

export function PerformanceCard({ data }: PerformanceCardProps) {
  const navigate = useNavigate();

  const metrics = [
    {
      label: 'Revenue',
      value: `$${(data?.revenue || 84213).toLocaleString()}`,
      growth: data?.revenueGrowth || 12,
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      label: 'Orders',
      value: (data?.orders || 1247).toLocaleString(),
      growth: data?.ordersGrowth || 8,
      icon: Package,
      color: 'text-blue-600'
    },
    {
      label: 'Customers',
      value: (data?.customers || 856).toLocaleString(),
      growth: 15,
      icon: Users,
      color: 'text-purple-600'
    }
  ];

  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Performance Dashboard</CardTitle>
        </div>
        <CardDescription>Key business metrics at a glance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metrics grid */}
        <div className="space-y-3">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div 
                key={metric.label}
                className="flex items-center justify-between p-3 bg-muted/30 rounded"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full bg-background ${metric.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{metric.label}</p>
                    <p className="text-lg font-bold">{metric.value}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-sm font-semibold">+{metric.growth}%</span>
                </div>
              </div>
            );
          })}
        </div>

        <Button 
          onClick={() => navigate('/kpi')}
          className="w-full"
          variant="default"
        >
          View Full Report
        </Button>
      </CardContent>
    </Card>
  );
}
