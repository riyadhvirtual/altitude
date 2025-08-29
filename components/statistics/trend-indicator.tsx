import { Minus, TrendingDown, TrendingUp } from 'lucide-react';

import { cn, formatChange } from '@/lib/utils';

interface TrendIndicatorProps {
  trend: 'up' | 'down' | 'stable';
  value: number;
  className?: string;
}

export function TrendIndicator({
  trend,
  value,
  className,
}: TrendIndicatorProps) {
  const isPositive = trend === 'up';
  const isNegative = trend === 'down';

  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <div
      className={cn(
        'flex items-center gap-1 text-xs font-medium',
        isPositive && 'text-green-600 dark:text-green-400',
        isNegative && 'text-red-600 dark:text-red-400',
        trend === 'stable' && 'text-muted-foreground',
        className
      )}
    >
      <Icon className="h-3 w-3" />
      <span>{formatChange(value)}</span>
    </div>
  );
}
