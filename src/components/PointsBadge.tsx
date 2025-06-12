
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { calculateProductPoints, formatPoints } from '@/utils/pointsCalculator';

interface PointsBadgeProps {
  price: number;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  size?: 'sm' | 'default';
  showIcon?: boolean;
  className?: string;
}

const PointsBadge = ({ 
  price, 
  variant = 'secondary',
  size = 'sm',
  showIcon = true,
  className = ''
}: PointsBadgeProps) => {
  const points = calculateProductPoints(price);
  
  if (points === 0) return null;

  return (
    <Badge 
      variant={variant} 
      className={`${className} ${size === 'sm' ? 'text-xs' : 'text-sm'} font-medium`}
    >
      {showIcon && <Star className="w-3 h-3 mr-1 fill-current" />}
      {formatPoints(points)}
    </Badge>
  );
};

export default PointsBadge;
