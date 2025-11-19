import { Card } from "@/components/ui/card";

const RecommendationEngineCard = () => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Actionable Recommendations</h3>
      <div className="space-y-3">
        <div className="p-4 bg-background border border-border rounded-lg">
          <div className="font-medium text-foreground mb-1">Comprar +22 unidades de ensalada</div>
          <div className="text-sm text-muted-foreground">Debido a alta demanda y baja rotación</div>
        </div>
        <div className="p-4 bg-background border border-border rounded-lg">
          <div className="font-medium text-foreground mb-1">Reducir producción de pan el sábado un 14%</div>
          <div className="text-sm text-muted-foreground">Proyección de baja venta</div>
        </div>
        <div className="p-4 bg-background border border-border rounded-lg">
          <div className="font-medium text-foreground mb-1">Activar promoción para frutas antes de que caiga la demanda</div>
          <div className="text-sm text-muted-foreground">Optimización de rotación de inventario</div>
        </div>
      </div>
    </Card>
  );
};

export default RecommendationEngineCard;
