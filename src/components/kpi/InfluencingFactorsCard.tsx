import { Card } from "@/components/ui/card";
import { InfluencingFactor } from "@/services/dashboardAnalyticsService";
import { TrendingUp, TrendingDown, Calendar, Cloud, Users, Package } from "lucide-react";
import { useTranslation } from "react-i18next";

interface InfluencingFactorsCardProps {
  data?: InfluencingFactor[];
  isLoading?: boolean;
}

const InfluencingFactorsCard = ({ data, isLoading }: InfluencingFactorsCardProps) => {
  const { t } = useTranslation();
  if (isLoading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-4 bg-muted/30 rounded-lg">
              <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">{t('cards.influencing_factors.title')}</h3>
        <div className="text-center py-8 text-muted-foreground">
          {t('cards.influencing_factors.no_data')}
        </div>
      </Card>
    );
  }

  const getFactorIcon = (factor: string) => {
    if (factor.toLowerCase().includes('weather') || factor.toLowerCase().includes('clima')) {
      return <Cloud className="w-5 h-5 text-info" />;
    }
    if (factor.toLowerCase().includes('season') || factor.toLowerCase().includes('temporada')) {
      return <Calendar className="w-5 h-5 text-primary" />;
    }
    if (factor.toLowerCase().includes('demand') || factor.toLowerCase().includes('demanda')) {
      return <Users className="w-5 h-5 text-success" />;
    }
    if (factor.toLowerCase().includes('stock') || factor.toLowerCase().includes('inventory')) {
      return <Package className="w-5 h-5 text-warning" />;
    }
    return <TrendingUp className="w-5 h-5 text-muted-foreground" />;
  };

  const getImpactColor = (impact: string) => {
    if (impact.toLowerCase().includes('high') || impact.toLowerCase().includes('alto')) {
      return 'text-destructive';
    }
    if (impact.toLowerCase().includes('positive') || impact.toLowerCase().includes('positivo')) {
      return 'text-success';
    }
    if (impact.toLowerCase().includes('negative') || impact.toLowerCase().includes('negativo')) {
      return 'text-destructive';
    }
    return 'text-warning';
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">{t('cards.influencing_factors.title')}</h3>
      <div className="text-sm text-muted-foreground mb-4">
        {t('cards.influencing_factors.subtitle')}
      </div>

      <div className="space-y-3">
        {data.map((factor, idx) => (
          <div key={idx} className="p-4 bg-background border border-border rounded-lg hover:border-primary/50 transition-colors">
            <div className="flex items-start gap-3 mb-2">
              {getFactorIcon(factor.factor)}
              <div className="flex-1">
                <div className="font-medium text-foreground mb-1">{factor.factor}</div>
                <div className="text-sm text-muted-foreground mb-2">{factor.description}</div>
                <div className={`text-sm font-medium ${getImpactColor(factor.impact)}`}>
                  {factor.impact.toLowerCase().includes('positivo') || factor.impact.toLowerCase().includes('positive') ? (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>{factor.impact}</span>
                    </div>
                  ) : factor.impact.toLowerCase().includes('negativo') || factor.impact.toLowerCase().includes('negative') ? (
                    <div className="flex items-center gap-1">
                      <TrendingDown className="w-4 h-4" />
                      <span>{factor.impact}</span>
                    </div>
                  ) : (
                    <span>{factor.impact}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default InfluencingFactorsCard;
