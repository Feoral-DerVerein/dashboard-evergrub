import { Card } from "@/components/ui/card";
import { Recommendation } from "@/services/dashboardAnalyticsService";
import { Badge } from "@/components/ui/badge";

interface RecommendationEngineCardProps {
  data?: Recommendation[];
  isLoading?: boolean;
}

const RecommendationEngineCard = ({ data, isLoading }: RecommendationEngineCardProps) => {
  if (isLoading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 bg-background border border-border rounded-lg">
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
        <h3 className="text-lg font-semibold text-foreground mb-4">Actionable Recommendations</h3>
        <div className="text-center py-8 text-muted-foreground">
          No recommendations available at this time
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Actionable Recommendations</h3>
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {data.map((rec, idx) => (
          <div key={idx} className="p-4 bg-background border border-border rounded-lg hover:border-primary/50 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="font-medium text-foreground">{rec.action}</div>
              <Badge variant="outline" className="ml-2">
                #{rec.priority}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground mb-1">{rec.reason}</div>
            <div className="text-sm text-primary font-medium">{rec.impact}</div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RecommendationEngineCard;
