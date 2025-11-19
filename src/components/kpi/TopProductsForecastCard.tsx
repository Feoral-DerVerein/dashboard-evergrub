import { Card } from "@/components/ui/card";
import { TopProduct } from "@/services/dashboardAnalyticsService";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

interface TopProductsForecastCardProps {
  data?: TopProduct[];
  isLoading?: boolean;
}

const TopProductsForecastCard = ({ data, isLoading }: TopProductsForecastCardProps) => {
  if (isLoading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="p-4 bg-muted/30 rounded-lg">
              <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-full mb-2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Top Products - Forecast vs Stock</h3>
        <div className="text-center py-8 text-muted-foreground">
          No hay datos de productos disponibles
        </div>
      </Card>
    );
  }

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'High':
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case 'Medium':
        return <TrendingUp className="w-5 h-5 text-warning" />;
      default:
        return <CheckCircle className="w-5 h-5 text-success" />;
    }
  };

  const getRiskBadgeVariant = (riskLevel: string): "destructive" | "default" | "secondary" => {
    switch (riskLevel) {
      case 'High':
        return 'destructive';
      case 'Medium':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Top Products - Forecast vs Stock</h3>
      
      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {data.map((product, idx) => (
          <div key={idx} className="p-4 bg-background border border-border rounded-lg hover:border-primary/50 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getRiskIcon(product.riskLevel)}
                <div className="font-medium text-foreground">{product.name}</div>
              </div>
              <Badge variant={getRiskBadgeVariant(product.riskLevel)}>
                {product.riskLevel} Risk
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <div className="text-xs text-muted-foreground">Current Stock</div>
                <div className="text-lg font-semibold text-foreground">{product.currentStock}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Forecast Demand</div>
                <div className="text-lg font-semibold text-primary">{product.forecastDemand}</div>
              </div>
            </div>

            <div className="mb-2">
              <div className="text-xs text-muted-foreground">Avg Daily Sales</div>
              <div className="text-sm font-medium text-foreground">{product.avgDailySales.toFixed(1)} units/day</div>
            </div>
            
            <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
              💡 {product.recommendation}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TopProductsForecastCard;
