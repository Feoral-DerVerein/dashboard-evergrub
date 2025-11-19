import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

const ScenarioSimulatorCard = () => {
  const [weatherChange, setWeatherChange] = useState([0]);
  const [priceChange, setPriceChange] = useState([0]);
  const [demandChange, setDemandChange] = useState([0]);

  // Calculate simulated results based on slider values
  const baseProjectedSales = 24850;
  const baseWaste = 340;
  const baseStock = 1250;
  const baseRisk = 18;

  const projectedSales = Math.round(baseProjectedSales * (1 + (weatherChange[0] * 0.15 + priceChange[0] * -0.2 + demandChange[0] * 0.25) / 100));
  const projectedWaste = Math.round(baseWaste * (1 - (weatherChange[0] * 0.1 + demandChange[0] * 0.15) / 100));
  const requiredStock = Math.round(baseStock * (1 + (demandChange[0] * 0.3) / 100));
  const totalRisk = Math.min(Math.max(Math.round(baseRisk + weatherChange[0] * 0.5 + Math.abs(priceChange[0]) * 0.3 + Math.abs(demandChange[0]) * 0.4), 0), 100);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">Scenario Simulator</h3>
      
      {/* Sliders Section */}
      <div className="space-y-6 mb-8">
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-foreground">Cambio en clima</span>
            <span className="text-sm text-muted-foreground">{weatherChange[0]}%</span>
          </div>
          <Slider
            value={weatherChange}
            onValueChange={setWeatherChange}
            min={-50}
            max={50}
            step={5}
            className="w-full"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-foreground">Cambio en precio</span>
            <span className="text-sm text-muted-foreground">{priceChange[0]}%</span>
          </div>
          <Slider
            value={priceChange}
            onValueChange={setPriceChange}
            min={-50}
            max={50}
            step={5}
            className="w-full"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-foreground">Cambio en demanda</span>
            <span className="text-sm text-muted-foreground">{demandChange[0]}%</span>
          </div>
          <Slider
            value={demandChange}
            onValueChange={setDemandChange}
            min={-50}
            max={50}
            step={5}
            className="w-full"
          />
        </div>
      </div>

      {/* Results Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-muted/30 rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Ventas proyectadas</div>
          <div className="text-2xl font-semibold text-foreground">${projectedSales.toLocaleString()}</div>
        </div>
        <div className="p-4 bg-muted/30 rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Merma proyectada</div>
          <div className="text-2xl font-semibold text-foreground">{projectedWaste} kg</div>
        </div>
        <div className="p-4 bg-muted/30 rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Stock necesario</div>
          <div className="text-2xl font-semibold text-foreground">{requiredStock}</div>
        </div>
        <div className="p-4 bg-muted/30 rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Riesgo total</div>
          <div className="text-2xl font-semibold text-foreground">{totalRisk}%</div>
        </div>
      </div>
    </Card>
  );
};

export default ScenarioSimulatorCard;
