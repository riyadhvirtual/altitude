import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type Airline } from '@/db/schema';

interface AirlineDetailsProps {
  airline: Airline;
}

export function AirlineDetails({ airline }: AirlineDetailsProps) {
  const initials = airline.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card className="border border-border bg-card">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="size-10">
          <AvatarFallback className="text-sm font-medium text-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-foreground text-lg">
            {airline.name}
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Callsign: {airline.callsign}
          </p>
        </div>
      </CardHeader>
      <CardContent />
    </Card>
  );
}
