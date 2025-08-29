import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { getEventById } from '@/db/queries';
import { events } from '@/db/schema';

export async function deleteEventRecord(
  eventId: string,
  userId: string
): Promise<boolean> {
  const event = await getEventById(eventId);
  if (!event) {
    throw new Error('Event not found');
  }

  if (event.createdBy !== userId) {
    throw new Error('You can only delete events you created');
  }

  await db.delete(events).where(eq(events.id, eventId));
  const success = true;
  if (!success) {
    throw new Error('Failed to delete event');
  }

  return true;
}

export async function deleteEvent(
  eventId: string,
  userId: string
): Promise<boolean> {
  return deleteEventRecord(eventId, userId);
}
