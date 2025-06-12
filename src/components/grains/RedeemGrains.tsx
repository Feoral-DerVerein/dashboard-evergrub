
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, ArrowRight } from 'lucide-react';
import { UserGrainBalance } from '@/services/grainService';

interface RedeemGrainsProps {
  balance: UserGrainBalance | null;
  onRedeem: (grains: number) => Promise<void>;
  loading: boolean;
}

const RedeemGrains = ({ balance, onRedeem, loading }: RedeemGrainsProps) => {
  const [grainAmount, setGrainAmount] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  const totalGrains = balance?.total_grains || 0;
  const grainValue = parseFloat(grainAmount) || 0;
  const cashValue = (grainValue / 2000) * 10; // 2000 grains = $10

  const handleRedeem = async () => {
    if (grainValue <= 0 || grainValue > totalGrains || grainValue < 2000) return;

    setIsRedeeming(true);
    try {
      await onRedeem(grainValue);
      setGrainAmount('');
    } finally {
      setIsRedeeming(false);
    }
  };

  const canRedeem = grainValue >= 2000 && grainValue <= totalGrains && !isRedeeming;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          Canjear Grains por Dinero
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Tasa de cambio:</strong> 2,000 grains = $10.00 AUD
          </p>
          <p className="text-xs text-yellow-600 mt-1">
            Mínimo requerido: 2,000 grains
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="grainAmount">Cantidad de Grains</Label>
            <Input
              id="grainAmount"
              type="number"
              placeholder="Ej: 2000"
              value={grainAmount}
              onChange={(e) => setGrainAmount(e.target.value)}
              min="2000"
              max={totalGrains}
              step="100"
            />
            <p className="text-xs text-gray-500">
              Disponible: {totalGrains.toLocaleString()} grains
            </p>
          </div>

          <div className="flex items-center justify-center">
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-2">
            <Label>Dinero a Recibir</Label>
            <div className="text-2xl font-bold text-green-600">
              ${cashValue.toFixed(2)}
            </div>
          </div>
        </div>

        <Button 
          onClick={handleRedeem}
          disabled={!canRedeem || loading}
          className="w-full"
          size="lg"
        >
          {isRedeeming ? 'Procesando...' : `Canjear ${grainValue.toLocaleString()} Grains`}
        </Button>

        {grainValue > 0 && grainValue < 2000 && (
          <p className="text-sm text-red-600">
            Necesitas al menos 2,000 grains para canjear por dinero.
          </p>
        )}

        {grainValue > totalGrains && (
          <p className="text-sm text-red-600">
            No tienes suficientes grains disponibles.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default RedeemGrains;
