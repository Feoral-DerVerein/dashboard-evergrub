
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, TrendingUp, DollarSign, History } from 'lucide-react';
import { UserGrainBalance } from '@/services/grainService';
import { formatPoints, formatPointsValue } from '@/utils/pointsCalculator';

interface GrainBalanceProps {
  balance: UserGrainBalance | null;
  loading: boolean;
}

const GrainBalance = ({ balance, loading }: GrainBalanceProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalGrains = balance?.total_grains || 0;
  const lifetimeEarned = balance?.lifetime_earned || 0;
  const lifetimeRedeemed = balance?.lifetime_redeemed || 0;
  const cashRedeemed = balance?.cash_redeemed || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Grains Disponibles</CardTitle>
          <Coins className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-700">
            {formatPoints(totalGrains).replace('pts', 'grains')}
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Valor: {formatPointsValue(totalGrains)}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Ganados</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-700">
            {formatPoints(lifetimeEarned).replace('pts', 'grains')}
          </div>
          <p className="text-xs text-gray-600 mt-1">Desde el inicio</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Canjeados</CardTitle>
          <History className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-700">
            {formatPoints(lifetimeRedeemed).replace('pts', 'grains')}
          </div>
          <p className="text-xs text-gray-600 mt-1">Historial completo</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Dinero Canjeado</CardTitle>
          <DollarSign className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-700">
            ${cashRedeemed.toFixed(2)}
          </div>
          <p className="text-xs text-gray-600 mt-1">Total en efectivo</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GrainBalance;
