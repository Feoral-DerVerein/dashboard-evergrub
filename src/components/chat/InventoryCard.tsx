import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle, TrendingDown, Box } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface InventoryCardProps {
  data?: {
    totalProducts?: number;
    lowStock?: number;
    expiringSoon?: number;
    outOfStock?: number;
  };
}

export function InventoryCard({ data }: InventoryCardProps) {
  const navigate = useNavigate();

  const stats = [
    {
      label: 'Total Products',
      value: data?.totalProducts || 1250,
      icon: Box,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Low Stock',
      value: data?.lowStock || 34,
      icon: TrendingDown,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      label: 'Expiring Soon',
      value: data?.expiringSoon || 23,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Inventory Overview</CardTitle>
          </div>
          {(data?.expiringSoon || 23) > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Alerts
            </Badge>
          )}
        </div>
        <CardDescription>Real-time stock status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats grid */}
        <div className="space-y-2">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.label}
                className="flex items-center justify-between p-3 bg-muted/30 rounded"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <span className="text-sm font-medium">{stat.label}</span>
                </div>
                <span className="text-xl font-bold">{stat.value}</span>
              </div>
            );
          })}
        </div>

        {/* Out of stock alert */}
        {(data?.outOfStock || 0) > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-800">
              <AlertTriangle className="h-4 w-4 inline mr-1" />
              {data?.outOfStock || 0} products out of stock
            </p>
          </div>
        )}

        <Button 
          onClick={() => navigate('/inventory-products')}
          className="w-full"
          variant="default"
        >
          Manage Inventory
        </Button>
      </CardContent>
    </Card>
  );
}
