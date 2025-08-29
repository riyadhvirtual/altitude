import { RouteWithNumbers } from '@/db/queries';
import { formatHoursMinutes } from '@/lib/utils';

interface RouteDetailsProps {
  route: RouteWithNumbers;
  aircraft?: { id: string; name: string; livery: string }[];
  plain?: boolean;
}

export function RouteDetails({
  route,
  aircraft = [],
  plain = false,
}: RouteDetailsProps) {
  const Wrapper = plain ? 'div' : 'div';
  const wrapperClasses = plain
    ? 'space-y-4'
    : 'space-y-4 rounded-md border border-border bg-card p-4';
  return (
    <Wrapper className={wrapperClasses}>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-muted-foreground">Route</span>
        <p className="text-foreground text-lg font-semibold uppercase">
          {route.departureIcao} → {route.arrivalIcao}
        </p>
      </div>

      {route.flightNumbers.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">
            Flight Numbers
          </span>
          <div className="flex flex-wrap gap-2">
            {route.flightNumbers.map((fn) => (
              <span
                key={fn}
                className="rounded-md bg-muted px-2 py-1 text-sm text-foreground"
              >
                {fn}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-muted-foreground">
          Flight Time
        </span>
        <p className="text-foreground font-medium">
          {formatHoursMinutes(route.flightTime)}
        </p>
      </div>

      {aircraft.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">
            Allowed Aircraft
          </span>
          <div className="flex flex-wrap gap-2">
            {aircraft.map((a) => (
              <span
                key={a.id}
                className="rounded bg-muted px-2 py-0.5 text-sm text-foreground"
              >
                {a.name} ({a.livery})
              </span>
            ))}
          </div>
        </div>
      )}
    </Wrapper>
  );
}
