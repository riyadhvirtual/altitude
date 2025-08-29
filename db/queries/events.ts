import { and, asc, count, desc, eq, gt, inArray } from 'drizzle-orm';

import { db } from '@/db';
import {
  type Event,
  type EventAircraft,
  eventAircraft,
  type EventGate,
  eventGates,
  type EventParticipant,
  eventParticipants,
  events,
  users,
} from '@/db/schema';

async function getEvents(): Promise<Event[]> {
  const result = await db
    .select()
    .from(events)
    .orderBy(desc(events.departureTime));
  return result;
}

async function getEventsPaginated(
  page: number,
  limit: number
): Promise<{ events: Event[]; total: number }> {
  const offset = (page - 1) * limit;

  const [eventsResult, totalResult] = await Promise.all([
    db
      .select()
      .from(events)
      .orderBy(desc(events.departureTime))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(events),
  ]);

  return {
    events: eventsResult,
    total: totalResult[0]?.count || 0,
  };
}

async function getEventById(id: string): Promise<Event | null> {
  const result = await db.select().from(events).where(eq(events.id, id)).get();
  return result ?? null;
}

async function getEventsByStatus(status: string): Promise<Event[]> {
  const result = await db
    .select()
    .from(events)
    .where(eq(events.status, status))
    .orderBy(desc(events.departureTime));
  return result;
}

async function getUpcomingEvents(): Promise<Event[]> {
  const result = await db
    .select()
    .from(events)
    .where(
      and(eq(events.status, 'published'), gt(events.departureTime, new Date()))
    )
    .orderBy(asc(events.departureTime));
  return result;
}

async function getActiveEvents(): Promise<Event[]> {
  const now = new Date();
  const allEvents = await db
    .select()
    .from(events)
    .where(eq(events.status, 'published'))
    .orderBy(asc(events.departureTime));

  const result = allEvents.filter((event) => {
    const departureTime = new Date(event.departureTime);
    const arrivalTime = new Date(
      departureTime.getTime() + event.flightTime * 60 * 1000
    );

    return departureTime > now || (departureTime <= now && arrivalTime > now);
  });

  return result;
}

async function getEventAircraft(eventId: string): Promise<EventAircraft[]> {
  const result = await db
    .select()
    .from(eventAircraft)
    .where(eq(eventAircraft.eventId, eventId));
  return result;
}

async function getEventGates(eventId: string): Promise<EventGate[]> {
  const result = await db
    .select()
    .from(eventGates)
    .where(eq(eventGates.eventId, eventId))
    .orderBy(eventGates.gateNumber);
  return result;
}

async function getEventGatesByType(
  eventId: string,
  airportType: string
): Promise<EventGate[]> {
  const result = await db
    .select()
    .from(eventGates)
    .where(
      and(
        eq(eventGates.eventId, eventId),
        eq(eventGates.airportType, airportType)
      )
    )
    .orderBy(eventGates.gateNumber);
  return result;
}

async function getEventParticipants(
  eventId: string
): Promise<EventParticipant[]> {
  const result = await db
    .select()
    .from(eventParticipants)
    .where(eq(eventParticipants.eventId, eventId))
    .orderBy(eventParticipants.joinedAt);
  return result;
}

async function getEventParticipantCounts(
  eventIds: string[]
): Promise<Record<string, number>> {
  if (eventIds.length === 0) {
    return {};
  }

  const rows = await db
    .select({ eventId: eventParticipants.eventId, count: count() })
    .from(eventParticipants)
    .where(inArray(eventParticipants.eventId, eventIds))
    .groupBy(eventParticipants.eventId);

  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.eventId] = row.count;
  }
  return counts;
}

async function getUserEventParticipations(
  userId: string
): Promise<EventParticipant[]> {
  const result = await db
    .select()
    .from(eventParticipants)
    .where(eq(eventParticipants.userId, userId))
    .orderBy(desc(eventParticipants.joinedAt));
  return result;
}

async function getEventParticipantsWithUserDetails(eventId: string): Promise<
  {
    participant: EventParticipant;
    user: { name: string; callsign: number | null; email: string };
  }[]
> {
  const result = await db
    .select({
      participant: {
        id: eventParticipants.id,
        eventId: eventParticipants.eventId,
        userId: eventParticipants.userId,
        departureGateId: eventParticipants.departureGateId,
        arrivalGateId: eventParticipants.arrivalGateId,
        joinedAt: eventParticipants.joinedAt,
        updatedAt: eventParticipants.updatedAt,
      },
      user: {
        name: users.name,
        callsign: users.callsign,
        email: users.email,
      },
    })
    .from(eventParticipants)
    .innerJoin(users, eq(eventParticipants.userId, users.id))
    .where(eq(eventParticipants.eventId, eventId))
    .orderBy(eventParticipants.joinedAt);

  return result;
}

export {
  getActiveEvents,
  getEventAircraft,
  getEventById,
  getEventGates,
  getEventGatesByType,
  getEventParticipantCounts,
  getEventParticipants,
  getEventParticipantsWithUserDetails,
  getEvents,
  getEventsByStatus,
  getEventsPaginated,
  getUpcomingEvents,
  getUserEventParticipations,
};
