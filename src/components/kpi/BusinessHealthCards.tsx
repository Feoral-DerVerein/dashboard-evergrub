import { Card } from "@/components/ui/card";

const BusinessHealthCards = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <Card className="p-4">
        <div className="text-sm text-muted-foreground mb-2">Rotación del inventario</div>
        <div className="text-3xl font-semibold text-foreground">8.2x</div>
      </Card>
      
      <Card className="p-4">
        <div className="text-sm text-muted-foreground mb-2">% de merma</div>
        <div className="text-3xl font-semibold text-foreground">3.4%</div>
      </Card>
      
      <Card className="p-4">
        <div className="text-sm text-muted-foreground mb-2">% de productos agotados</div>
        <div className="text-3xl font-semibold text-foreground">2.1%</div>
      </Card>
      
      <Card className="p-4">
        <div className="text-sm text-muted-foreground mb-2">Productos más volátiles</div>
        <div className="text-3xl font-semibold text-foreground">12</div>
      </Card>
      
      <Card className="p-4">
        <div className="text-sm text-muted-foreground mb-2">Score general</div>
        <div className="text-3xl font-semibold text-foreground">87/100</div>
      </Card>
    </div>
  );
};

export default BusinessHealthCards;
