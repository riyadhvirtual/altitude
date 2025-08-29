import { cn } from '@/lib/utils';

import { Badge } from './badge';

type Status = 'pending' | 'approved' | 'denied' | string;

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusVariant =
    status === 'pending'
      ? 'pending'
      : status === 'approved'
        ? 'approved'
        : status === 'denied'
          ? 'denied'
          : 'secondary';

  return (
    <Badge variant={statusVariant} className={cn(className)}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
