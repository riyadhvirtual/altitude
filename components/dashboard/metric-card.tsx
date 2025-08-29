import { Card, CardContent, CardHeader } from '@/components/ui/card';

export interface MetricCardProps {
  title: string;
  value: string | number;
}

export const MetricCard = ({ title, value }: MetricCardProps) => {
  return (
    <Card className="gap-2 rounded-md border border-input bg-panel py-0 shadow-sm">
      <CardHeader className="p-4 pb-0">
        <span className="font-medium text-muted-foreground text-sm">
          {title}
        </span>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <span className="font-bold text-foreground text-xl">{value}</span>
      </CardContent>
    </Card>
  );
};
