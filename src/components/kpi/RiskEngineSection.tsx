import { Card } from "@/components/ui/card";
import { RiskEngine } from "@/services/dashboardAnalyticsService";
import { Badge } from "@/components/ui/badge";

interface RiskEngineSectionProps {
  data?: RiskEngine;
  isLoading?: boolean;
}

const RiskEngineSection = ({ data, isLoading }: RiskEngineSectionProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 animate-pulse">
          <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="p-4 bg-muted/30 rounded-lg">
                <div className="h-4 bg-muted rounded w-2/3 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6 animate-pulse">
          <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="p-3 border border-border rounded-lg">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const getRiskColor = (risk: number) => {
    if (risk > 50) return 'text-destructive';
    if (risk > 25) return 'text-warning';
    return 'text-success';
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, "destructive" | "default" | "secondary"> = {
      high: 'destructive',
      medium: 'default',
      low: 'secondary',
    };
    return variants[severity] || 'default';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Risk Overview Card */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Risk Overview</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Stockout Risk</div>
            <div className={`text-2xl font-semibold ${getRiskColor(data.stockoutRisk)}`}>
              {data.stockoutRisk.toFixed(1)}%
            </div>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Overstock Risk</div>
            <div className={`text-2xl font-semibold ${getRiskColor(data.overstockRisk)}`}>
              {data.overstockRisk.toFixed(1)}%
            </div>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Weather Sensitivity</div>
            <div className="text-2xl font-semibold text-foreground">{data.weatherSensitivity}</div>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Volatility Index</div>
            <div className="text-2xl font-semibold text-foreground">{data.volatilityIndex}</div>
          </div>
        </div>
      </Card>

      {/* Critical SKUs Card */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Critical SKUs</h3>
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {data.criticalProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay productos críticos en este momento
            </div>
          ) : (
            data.criticalProducts.map((product, idx) => (
              <div key={idx} className="p-3 border border-border rounded-lg">
                <div className="flex items-start justify-between mb-1">
                  <div className="font-medium text-foreground">{product.sku} - {product.name}</div>
                  <Badge variant={getSeverityBadge(product.severity)}>
                    {product.severity}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">{product.reason}</div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default RiskEngineSection;
