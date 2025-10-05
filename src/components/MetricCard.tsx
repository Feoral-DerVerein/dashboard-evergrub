import { ArrowUpIcon, ArrowDownIcon, TrendingUp, RefreshCw, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { MetricValue } from '@/hooks/useMetricsData';

interface MetricCardProps {
  title: string;
  value: MetricValue;
  icon?: React.ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onClick?: () => void;
  format?: 'currency' | 'number' | 'percentage' | 'kg';
}

export function MetricCard({ 
  title, 
  value, 
  icon, 
  isLoading, 
  isError,
  onRetry,
  onClick,
  format = 'number'
}: MetricCardProps) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return `$${val.toFixed(2)}`;
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'kg':
        return `${val.toFixed(1)} kg`;
      default:
        return val.toFixed(0);
    }
  };

  if (isLoading) {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-20" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center gap-3 py-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
            <div className="text-sm text-destructive text-center">
              Failed to load {title}
            </div>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRetry();
                }}
                className="gap-2"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPositive = value.change >= 0;
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600';

  return (
    <Card 
      className={cn(
        "hover:shadow-lg transition-all duration-200",
        onClick && "cursor-pointer hover:scale-105"
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          {icon && (
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              {icon}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="text-3xl font-bold">
            {formatValue(value.current)}
          </div>
          
          <div className="flex items-center gap-2">
            <div className={cn("flex items-center gap-1 text-sm font-medium", changeColor)}>
              {isPositive ? (
                <ArrowUpIcon className="w-4 h-4" />
              ) : (
                <ArrowDownIcon className="w-4 h-4" />
              )}
              <span>{Math.abs(value.change).toFixed(1)}%</span>
            </div>
            <span className="text-xs text-muted-foreground">vs last period</span>
          </div>
        </div>

        {onClick && (
          <div className="mt-4 text-xs text-primary flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Click for details
          </div>
        )}
      </CardContent>
    </Card>
  );
}
