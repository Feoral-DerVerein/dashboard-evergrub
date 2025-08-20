
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
  // Points functionality removed as it will be integrated into smart bags
  return null;
};

export default PointsBadge;
