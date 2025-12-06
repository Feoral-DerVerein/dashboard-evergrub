import { Card } from "@/components/ui/card";
import { BusinessHealth } from "@/services/dashboardAnalyticsService";
import { useTranslation } from "react-i18next";

interface BusinessHealthCardsProps {
  data?: BusinessHealth;
  isLoading?: boolean;
}

const BusinessHealthCards = ({ data, isLoading }: BusinessHealthCardsProps) => {
  const { t } = useTranslation();
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map(i => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <Card className="p-4">
        <div className="text-sm text-muted-foreground mb-2">{t('cards.business_health.inventory_turnover')}</div>
        <div className="text-3xl font-semibold text-foreground">{data.inventoryTurnover}x</div>
      </Card>

      <Card className="p-4">
        <div className="text-sm text-muted-foreground mb-2">{t('cards.business_health.waste_percentage')}</div>
        <div className={`text-3xl font-semibold ${data.wastePercentage > 5 ? 'text-destructive' : 'text-success'}`}>
          {data.wastePercentage.toFixed(1)}%
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-sm text-muted-foreground mb-2">{t('cards.business_health.stockout_percentage')}</div>
        <div className={`text-3xl font-semibold ${data.stockoutPercentage > 5 ? 'text-warning' : 'text-success'}`}>
          {data.stockoutPercentage.toFixed(1)}%
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-sm text-muted-foreground mb-2">{t('cards.business_health.volatile_products')}</div>
        <div className="text-3xl font-semibold text-foreground">{data.volatileProducts}</div>
      </Card>

      <Card className="p-4">
        <div className="text-sm text-muted-foreground mb-2">{t('cards.business_health.overall_score')}</div>
        <div className={`text-3xl font-semibold ${getScoreColor(data.overallScore)}`}>
          {data.overallScore}/100
        </div>
      </Card>
    </div>
  );
};

export default BusinessHealthCards;
