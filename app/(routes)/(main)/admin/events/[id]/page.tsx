import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AdminEventDetails } from '@/components/events/admin-event-details';
import { Button } from '@/components/ui/button';
import {
  getEventById,
  getEventGates,
  getEventParticipantsWithUserDetails,
} from '@/db/queries';
import { requireRole } from '@/lib/auth-check';

export default async function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(['events']);

  const { id } = await params;

  const event = await getEventById(id);
  if (!event) {
    notFound();
  }

  const [participants, gates] = await Promise.all([
    getEventParticipantsWithUserDetails(id),
    getEventGates(id),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild size="sm" variant="outline">
          <Link href="/admin/events">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Link>
        </Button>
        <div className="h-6 w-px bg-border" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
        </div>
      </div>
      <AdminEventDetails
        event={event}
        participants={participants}
        gates={gates}
      />
    </div>
  );
}
