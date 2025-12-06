import { Card } from "@/components/ui/card";
import { Alert } from "@/services/dashboardAnalyticsService";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AlertCenterCardProps {
  data?: Alert[];
  isLoading?: boolean;
}

const AlertCenterCard = ({ data, isLoading }: AlertCenterCardProps) => {
  const { t } = useTranslation();
  if (isLoading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 bg-background border border-border rounded-lg">
              <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-warning" />;
      default:
        return <Info className="w-5 h-5 text-info" />;
    }
  };

  const getAlertBadgeVariant = (severity: string): "destructive" | "default" | "secondary" => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">{t('cards.alert_center.title')}</h3>
        <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-2">
          <Info className="w-8 h-8 opacity-50" />
          <p>{t('cards.alert_center.no_alerts')}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">{t('cards.alert_center.title')}</h3>
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {data.map((alert, idx) => (
          <div key={idx} className="p-4 bg-background border border-border rounded-lg">
            <div className="flex items-start gap-3">
              {getAlertIcon(alert.severity)}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                  <div className="font-medium text-foreground">{alert.title}</div>
                  <Badge variant={getAlertBadgeVariant(alert.severity)} className="ml-2">
                    {alert.severity}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-1">{alert.description}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(alert.timestamp).toLocaleString('en-US')}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default AlertCenterCard;
