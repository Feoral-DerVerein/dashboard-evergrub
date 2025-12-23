import { Card } from "@/components/ui/card";
import { HelpTooltip } from "@/components/dashboard/HelpTooltip";
import { TopProduct } from "@/services/dashboardAnalyticsService";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface TopProductsForecastCardProps {
  data?: TopProduct[];
  isLoading?: boolean;
}

const TopProductsForecastCard = ({ data, isLoading }: TopProductsForecastCardProps) => {
  const { t } = useTranslation();
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
        <h3 className="text-lg font-semibold text-foreground mb-4">{t('cards.top_products.title')}</h3>
        <div className="text-center py-8 text-muted-foreground">
          {t('cards.top_products.no_data')}
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
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        {t('cards.top_products.title')}
        <HelpTooltip kpiName={t('cards.top_products.title')} />
      </h3>

      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {data.map((product, idx) => (
          <div key={idx} className="p-4 bg-background border border-border rounded-lg hover:border-primary/50 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getRiskIcon(product.riskLevel)}
                <div className="font-medium text-foreground">{product.name}</div>
              </div>
              <Badge variant={getRiskBadgeVariant(product.riskLevel)}>
                {product.riskLevel} {t('cards.top_products.risk')}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <div className="text-xs text-muted-foreground">{t('cards.top_products.current_stock')}</div>
                <div className="text-lg font-semibold text-foreground">{product.currentStock}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">{t('cards.top_products.forecast_demand')}</div>
                <div className="text-lg font-semibold text-primary">{product.forecastDemand}</div>
              </div>
            </div>

            <div className="mb-2">
              <div className="text-xs text-muted-foreground">{t('cards.top_products.avg_daily_sales')}</div>
              <div className="text-sm font-medium text-foreground">{product.avgDailySales.toFixed(1)} {t('cards.top_products.units_day')}</div>
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
