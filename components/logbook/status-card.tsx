import { CheckCircle, Clock, XCircle } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';

interface StatusCardProps {
  status: string;
  className?: string;
}

export function StatusCard({ status, className = '' }: StatusCardProps) {
  const getStatusIcon = (statusValue: string) => {
    const normalizedStatus = statusValue.toLowerCase();
    switch (normalizedStatus) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'denied':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (statusValue: string) => (
    <div className="w-full flex justify-center">
      <StatusBadge
        status={statusValue}
        className="px-4 py-2 text-sm w-full justify-center inline-flex items-center gap-2"
      />
    </div>
  );

  return (
    <Card
      className={`relative rounded-[var(--radius-sm)] border border-input bg-panel shadow-sm ${className}`}
    >
      <CardContent className="pl-4 pr-4 h-full flex flex-col">
        {/* Header with title and icon aligned at the top */}
        <div className="flex items-center justify-between mb-1">
          <p className="text-muted-foreground text-lg">Status</p>
          <span>{getStatusIcon(status)}</span>
        </div>

        {/* Status badge - centered in remaining space */}
        <div className="flex-1 flex items-center">{getStatusBadge(status)}</div>
      </CardContent>
    </Card>
  );
}
