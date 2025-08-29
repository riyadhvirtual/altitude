import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { EventDetails } from '@/components/events/event-details';
import { Button } from '@/components/ui/button';
import {
  getAircraft,
  getEventAircraft,
  getEventById,
  getEventGates,
  getEventParticipantsWithUserDetails,
} from '@/db/queries';
import { getAirline } from '@/db/queries/airline';
import { authCheck } from '@/lib/auth-check';

export default async function PilotEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await authCheck();

  const { id } = await params;

  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  const [participants, aircraft, gates, allAircraft, airline] =
    await Promise.all([
      getEventParticipantsWithUserDetails(id),
      getEventAircraft(id),
      getEventGates(id),
      getAircraft(),
      getAirline(),
    ]);

  const isParticipating = participants.some(
    (p) => p.participant.userId === session.user.id
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href="/events">
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Link>
        </Button>
        <div className="h-6 w-px bg-border" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
        </div>
      </div>
      <EventDetails
        event={event}
        participants={participants}
        aircraft={aircraft}
        gates={gates}
        aircraftDetails={allAircraft}
        isParticipating={isParticipating}
        airline={airline}
      />
    </div>
  );
}
