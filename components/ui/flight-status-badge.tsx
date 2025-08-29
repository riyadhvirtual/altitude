import { Badge } from '@/components/ui/badge';

type FlightStatus = 'approved' | 'pending' | 'denied' | 'rejected';

interface FlightStatusBadgeProps {
  status: string;
  className?: string;
}

const statusBgMap: Record<FlightStatus, string> = {
  approved: 'bg-green-800',
  pending: 'bg-yellow-800',
  denied: 'bg-red-800',
  rejected: 'bg-red-800',
};

export function FlightStatusBadge({
  status,
  className,
}: FlightStatusBadgeProps) {
  const normalizedStatus = status.toLowerCase() as FlightStatus;
  const bgClass = statusBgMap[normalizedStatus] || 'bg-gray-800';

  return (
    <Badge className={`capitalize ${bgClass} ${className || ''}`}>
      {status}
    </Badge>
  );
}
