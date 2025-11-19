import { Card } from "@/components/ui/card";

const RiskEngineSection = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Risk Overview Card */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Risk Overview</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Stockout Risk</div>
            <div className="text-2xl font-semibold text-foreground">24%</div>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Overstock Risk</div>
            <div className="text-2xl font-semibold text-foreground">12%</div>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Weather Sensitivity</div>
            <div className="text-2xl font-semibold text-foreground">High</div>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Volatility Index</div>
            <div className="text-2xl font-semibold text-foreground">Medium</div>
          </div>
        </div>
      </Card>

      {/* Critical SKUs Card */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Critical SKUs</h3>
        <div className="space-y-3">
          <div className="p-3 border border-border rounded-lg">
            <div className="font-medium text-foreground mb-1">SKU-089 - Organic Tomatoes</div>
            <div className="text-sm text-muted-foreground">High stockout probability in 48h</div>
          </div>
          <div className="p-3 border border-border rounded-lg">
            <div className="font-medium text-foreground mb-1">SKU-023 - Fresh Bread</div>
            <div className="text-sm text-muted-foreground">Overstock risk detected</div>
          </div>
          <div className="p-3 border border-border rounded-lg">
            <div className="font-medium text-foreground mb-1">SKU-156 - Greek Yogurt</div>
            <div className="text-sm text-muted-foreground">Weather-sensitive demand spike</div>
          </div>
          <div className="p-3 border border-border rounded-lg">
            <div className="font-medium text-foreground mb-1">SKU-201 - Ice Cream</div>
            <div className="text-sm text-muted-foreground">High volatility next week</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RiskEngineSection;
