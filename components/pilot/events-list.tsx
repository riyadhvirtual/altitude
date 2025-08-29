import { ArrowRight, CalendarDays, Clock, MapPin, Users } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fileUrl } from '@/lib/urls';

type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';

interface EventItem {
  id: string;
  title: string;
  imageUrl?: string | null;
  departureTime: Date;
  participantsCount: number;
  departureIcao: string;
  arrivalIcao: string;
  status?: EventStatus;
  flightTime?: number;
}

interface EventsListProps {
  events: EventItem[];
}

function formatEventDate(date: Date) {
  const now = new Date();
  const eventDate = new Date(date);

  if (eventDate.toDateString() === now.toDateString()) {
    return 'Today';
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (eventDate.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }

  return eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

function formatTimeUntil(date: Date) {
  const now = Date.now();
  const diff = new Date(date).getTime() - now;

  if (diff < 0) {
    return 'Event has started';
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    if (hours > 0) {
      return `${days} day${days === 1 ? '' : 's'} and ${hours} hour${hours === 1 ? '' : 's'}`;
    } else {
      return `${days} day${days === 1 ? '' : 's'}`;
    }
  } else if (hours > 0) {
    if (minutes > 0) {
      return `${hours} hour${hours === 1 ? '' : 's'} and ${minutes} minute${minutes === 1 ? '' : 's'}`;
    } else {
      return `${hours} hour${hours === 1 ? '' : 's'}`;
    }
  } else {
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  }
}

function getDerivedStatus(
  event: EventItem
): 'draft' | 'published' | 'finished' {
  const now = Date.now();
  const dep = new Date(event.departureTime).getTime();

  if (event.status === 'completed') {
    return 'finished';
  }
  if (event.status === 'cancelled') {
    return 'finished';
  }
  if (event.status === 'draft') {
    return 'draft';
  }

  if (event.flightTime && Number.isFinite(event.flightTime)) {
    const end = dep + event.flightTime * 60 * 1000;
    if (now > end) {
      return 'finished';
    }
    return 'published';
  }
  if (now > dep) {
    return 'finished';
  }
  return 'published';
}

export function EventsList({ events }: EventsListProps) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h3 className="mb-2 text-xl font-semibold text-foreground">
          No events for now
        </h3>
        <p className="mb-6 text-muted-foreground">
          You should come back later!
        </p>
        <Button asChild>
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const statusOrder: Record<'draft' | 'published' | 'finished', number> = {
    draft: 0,
    published: 1,
    finished: 2,
  };

  const sortedEvents = [...events].sort(
    (a: EventItem, b: EventItem): number => {
      const aStatus = getDerivedStatus(a);
      const bStatus = getDerivedStatus(b);
      if (aStatus !== bStatus) {
        return statusOrder[aStatus] - statusOrder[bStatus];
      }
      const aTime = new Date(a.departureTime).getTime();
      const bTime = new Date(b.departureTime).getTime();
      return aTime - bTime;
    }
  );

  return (
    <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {sortedEvents.map((event: EventItem) => {
        const timeUntil = formatTimeUntil(event.departureTime);
        const eventDate = formatEventDate(event.departureTime);
        const derivedStatus = getDerivedStatus(event);
        const showCountdown = derivedStatus !== 'finished';

        return (
          <div
            key={event.id}
            className="flex w-full flex-col overflow-hidden rounded-md border border-input bg-panel shadow-sm transition-all hover:shadow-lg"
          >
            {event.imageUrl ? (
              <div className="relative h-56 w-full bg-muted">
                <img
                  src={fileUrl(event.imageUrl)}
                  alt={event.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-3 left-4 right-4">
                  <div className="inline-flex items-center gap-3 rounded-md bg-background/80 px-3 py-2 text-sm text-foreground backdrop-blur">
                    {showCountdown ? (
                      <>
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">
                          Event in {timeUntil}
                        </span>
                      </>
                    ) : (
                      <Badge variant="secondary">Finished</Badge>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative flex h-56 w-full items-center justify-center bg-muted">
                <div className="text-center">
                  <div className="text-muted-foreground mb-3 text-sm">
                    No image
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    {showCountdown ? (
                      <>
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">
                          Event in {timeUntil}
                        </span>
                      </>
                    ) : (
                      <Badge variant="secondary">Finished</Badge>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="w-full space-y-4 p-6">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <h3 className="text-xl font-semibold text-foreground">
                    {event.title}
                  </h3>
                  {derivedStatus === 'draft' && (
                    <Badge variant="pending">Draft</Badge>
                  )}
                  {derivedStatus === 'published' && (
                    <Badge variant="approved">Published</Badge>
                  )}
                  {derivedStatus === 'finished' && (
                    <Badge variant="secondary">Finished</Badge>
                  )}
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 flex-shrink-0" />
                    {eventDate}
                  </span>
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4 flex-shrink-0" />
                    {event.participantsCount} participant
                    {event.participantsCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="font-mono">
                  {event.departureIcao} → {event.arrivalIcao}
                </span>
              </div>

              <div className="pt-3">
                <Button asChild className="w-full">
                  <Link href={`/events/${event.id}`}>
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
