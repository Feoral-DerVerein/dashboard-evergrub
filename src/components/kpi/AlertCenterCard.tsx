import { Card } from "@/components/ui/card";

const AlertCenterCard = () => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Alerts</h3>
      <div className="space-y-3">
        <div className="p-4 bg-background border border-border rounded-lg">
          <div className="font-medium text-foreground mb-1">Te quedarás sin tortillas en 8 horas</div>
          <div className="text-sm text-muted-foreground">Stock crítico detectado, recomendamos pedido urgente</div>
        </div>
        <div className="p-4 bg-background border border-border rounded-lg">
          <div className="font-medium text-foreground mb-1">Sobreproducción detectada en croissants</div>
          <div className="text-sm text-muted-foreground">Inventario excede demanda proyectada en 35%</div>
        </div>
        <div className="p-4 bg-background border border-border rounded-lg">
          <div className="font-medium text-foreground mb-1">Demanda anormal en bebidas por ola de calor</div>
          <div className="text-sm text-muted-foreground">Temperatura elevada proyectada incrementará ventas 25%</div>
        </div>
      </div>
    </Card>
  );
};

export default AlertCenterCard;
