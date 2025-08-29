import { Card, CardContent, CardHeader } from '@/components/ui/card';

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

export const StatisticsSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Tabs skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1 p-1 bg-muted rounded-lg max-w-md">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-9 w-20 bg-background rounded animate-pulse"
            />
          ))}
        </div>
      </div>

      {/* Metric cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};
