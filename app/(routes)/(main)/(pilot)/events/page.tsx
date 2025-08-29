import type { Metadata } from 'next';

import { EventsList } from '@/components/pilot/events-list';
import { getEventParticipantCounts, getUpcomingEvents } from '@/db/queries';
import { requireAuth } from '@/lib/auth-check';

export function generateMetadata(): Metadata {
  return {
    title: 'Events',
  };
}

export default async function PilotEventsPage() {
  await requireAuth();

  const upcomingEvents = await getUpcomingEvents();

  const countsByEventId = await getEventParticipantCounts(
    upcomingEvents.map((e) => e.id)
  );
  const eventsWithCounts = upcomingEvents.map((event) => ({
    id: event.id,
    title: event.title,
    imageUrl: event.imageUrl,
    departureTime: event.departureTime,
    participantsCount: countsByEventId[event.id] ?? 0,
    departureIcao: event.departureIcao,
    arrivalIcao: event.arrivalIcao,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="space-y-1 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-2xl md:text-3xl text-foreground break-normal">
              Events
            </h3>
          </div>
          <p className="text-muted-foreground">
            Join upcoming flight events and connect with other pilots
          </p>
        </div>
      </div>
      <EventsList events={eventsWithCounts} />
    </div>
  );
}
