
import { Coins, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { calculatePointsValue, formatPoints, formatPointsValue } from '@/utils/pointsCalculator';

interface GrainsSectionProps {
  totalGrains: number;
  className?: string;
}

const GrainsSection = ({ totalGrains, className = '' }: GrainsSectionProps) => {
  const grainsValue = calculatePointsValue(totalGrains);

  return (
    <Card className={`bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Coins className="w-5 h-5 text-yellow-600" />
          Your Grains
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-3xl font-bold text-yellow-700">
              {formatPoints(totalGrains).replace('pts', 'grains')}
            </p>
            <p className="text-sm text-gray-600 mt-1">Available to redeem</p>
          </div>
          
          <div className="bg-white/60 rounded-lg p-3 border border-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Cash Value</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatPointsValue(totalGrains)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Exchange Rate</p>
                <p className="text-sm font-medium text-gray-700">2,000 grains = $10</p>
              </div>
            </div>
          </div>

          {totalGrains >= 2000 && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded-lg border border-green-200">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Ready to redeem!</span>
            </div>
          )}
          
          {totalGrains > 0 && totalGrains < 2000 && (
            <div className="text-xs text-gray-500">
              Earn {(2000 - totalGrains).toLocaleString()} more grains to redeem $10
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GrainsSection;
