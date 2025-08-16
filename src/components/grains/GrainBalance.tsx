
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
      <Card className="bg-white/80 border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-black">Available Grains</CardTitle>
          <Coins className="h-4 w-4 text-black" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-black">
            {formatPoints(totalGrains).replace('pts', 'grains')}
          </div>
          <p className="text-xs text-black mt-1">
            Value: {formatPointsValue(totalGrains)}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/80 border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-black">Total Earned</CardTitle>
          <TrendingUp className="h-4 w-4 text-black" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-black">
            {formatPoints(lifetimeEarned).replace('pts', 'grains')}
          </div>
          <p className="text-xs text-black mt-1">Since beginning</p>
        </CardContent>
      </Card>

      <Card className="bg-white/80 border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-black">Total Redeemed</CardTitle>
          <History className="h-4 w-4 text-black" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-black">
            {formatPoints(lifetimeRedeemed).replace('pts', 'grains')}
          </div>
          <p className="text-xs text-black mt-1">Complete history</p>
        </CardContent>
      </Card>

      <Card className="bg-white/80 border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-black">Cash Redeemed</CardTitle>
          <DollarSign className="h-4 w-4 text-black" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-black">
            ${cashRedeemed.toFixed(2)}
          </div>
          <p className="text-xs text-black mt-1">Total in cash</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GrainBalance;
