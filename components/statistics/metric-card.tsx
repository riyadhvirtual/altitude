'use client';

import { Sparkline } from '@/components/charts/sparkline';
import { TrendIndicator } from '@/components/statistics/trend-indicator';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatValue } from '@/lib/utils';
import type { SparklineData } from '@/types/statistics';

export interface MetricCardProps {
  title: string;
  value: string | number;
  sparklineData?: SparklineData;
  format?: 'number' | 'hours' | 'percentage';
  loading?: boolean;
}

const MetricCardSkeleton = () => (
  <Card className="gap-2 rounded-md border border-input bg-panel py-0 shadow-sm">
    <CardHeader className="p-4 pb-0">
      <div className="flex items-center justify-between">
        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
        <div className="h-4 w-12 bg-muted rounded animate-pulse" />
      </div>
    </CardHeader>
    <CardContent className="p-4 pt-0">
      <div className="flex flex-col gap-2">
        <div className="h-6 w-16 bg-muted rounded animate-pulse" />
        <div className="h-8 w-full bg-muted rounded animate-pulse" />
      </div>
    </CardContent>
  </Card>
);

export const MetricCard = ({
  title,
  value,
  sparklineData,
  format = 'number',
  loading = false,
}: MetricCardProps) => {
  if (loading) {
    return <MetricCardSkeleton />;
  }

  return (
    <Card className="gap-2 rounded-md border border-input bg-panel py-0 shadow-sm">
      <CardHeader className="p-4 pb-0">
        <div className="flex items-center justify-between">
          <span className="font-medium text-muted-foreground text-sm">
            {title}
          </span>
          {sparklineData && (
            <TrendIndicator
              value={sparklineData.change}
              trend={sparklineData.trend}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex flex-col gap-2">
          <span className="font-bold text-foreground text-xl">
            {formatValue(value, format)}
          </span>

          {/* Sparkline chart */}
          {sparklineData && sparklineData.data.length > 0 && (
            <div className="h-8 w-full min-w-0">
              <Sparkline
                data={sparklineData.data}
                trend={sparklineData.trend}
                width={undefined} // Use full width
                height={32}
                animated={true}
              />
            </div>
          )}

          {/* Empty state for sparkline */}
          {sparklineData && sparklineData.data.length === 0 && (
            <div className="h-8 w-full flex items-center justify-center text-muted-foreground">
              <span className="text-xs">No trend data</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
