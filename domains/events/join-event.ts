import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/db';
import {
  getEventById,
  getEventGates,
  getEventGatesByType,
  getEventParticipants,
} from '@/db/queries';
import { type EventParticipant, eventParticipants } from '@/db/schema';

const _joinEventSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  departureGateId: z.string().optional(),
  arrivalGateId: z.string().optional(),
});

const _leaveEventSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
});

const _assignGateSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  gateId: z.string().min(1, 'Gate ID is required'),
  gateType: z.enum(['departure', 'arrival']),
});

type JoinEventData = z.infer<typeof _joinEventSchema>;
type LeaveEventData = z.infer<typeof _leaveEventSchema>;
type AssignGateData = z.infer<typeof _assignGateSchema>;

// Database mutations
async function joinEventMutation(
  eventId: string,
  userId: string,
  departureGateId?: string,
  arrivalGateId?: string
): Promise<EventParticipant | null> {
  const result = await db
    .insert(eventParticipants)
    .values({
      id: crypto.randomUUID(),
      eventId,
      userId,
      departureGateId,
      arrivalGateId,
      joinedAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();
  return result[0] ?? null;
}

async function leaveEventMutation(
  eventId: string,
  userId: string
): Promise<boolean> {
  await db
    .delete(eventParticipants)
    .where(
      and(
        eq(eventParticipants.eventId, eventId),
        eq(eventParticipants.userId, userId)
      )
    );
  return true;
}

async function assignGateToParticipantMutation(
  eventId: string,
  userId: string,
  gateId: string,
  gateType: 'departure' | 'arrival'
): Promise<EventParticipant | null> {
  const updateData =
    gateType === 'departure'
      ? { departureGateId: gateId }
      : { arrivalGateId: gateId };

  const result = await db
    .update(eventParticipants)
    .set({ ...updateData, updatedAt: new Date() })
    .where(
      and(
        eq(eventParticipants.eventId, eventId),
        eq(eventParticipants.userId, userId)
      )
    )
    .returning();
  return result[0] ?? null;
}

async function unassignGateFromParticipantMutation(
  eventId: string,
  userId: string,
  gateType: 'departure' | 'arrival'
): Promise<EventParticipant | null> {
  const updateData =
    gateType === 'departure'
      ? { departureGateId: null }
      : { arrivalGateId: null };

  const result = await db
    .update(eventParticipants)
    .set({ ...updateData, updatedAt: new Date() })
    .where(
      and(
        eq(eventParticipants.eventId, eventId),
        eq(eventParticipants.userId, userId)
      )
    )
    .returning();
  return result[0] ?? null;
}

async function findAvailableGate(
  eventId: string,
  gateType: 'departure' | 'arrival'
): Promise<string | undefined> {
  // Get all gates of the specified type for this event
  const gates = await getEventGatesByType(eventId, gateType);
  if (gates.length === 0) {
    return undefined;
  }

  // Get all participants who already have a gate assigned
  const participants = await getEventParticipants(eventId);
  const assignedGateIds = participants
    .map((p) =>
      gateType === 'departure' ? p.departureGateId : p.arrivalGateId
    )
    .filter((id): id is string => id !== null);

  // Find the first gate that's not assigned
  const availableGate = gates.find(
    (gate) => !assignedGateIds.includes(gate.id)
  );

  return availableGate?.id;
}

export async function joinEventRecord(
  data: JoinEventData & { departureGateId?: string; arrivalGateId?: string },
  userId: string
): Promise<EventParticipant> {
  const event = await getEventById(data.eventId);
  if (!event) {
    throw new Error('Event not found');
  }

  if (event.status !== 'published') {
    throw new Error('Event is not open for participation');
  }

  const existingParticipant = await getEventParticipants(data.eventId);
  const isAlreadyParticipating = existingParticipant.some(
    (p) => p.userId === userId
  );

  if (isAlreadyParticipating) {
    throw new Error('You are already participating in this event');
  }

  let departureGateId = data.departureGateId;
  let arrivalGateId = data.arrivalGateId;

  // If no gates were manually selected, try to auto-assign
  if (!departureGateId && !arrivalGateId) {
    [departureGateId, arrivalGateId] = await Promise.all([
      findAvailableGate(data.eventId, 'departure'),
      findAvailableGate(data.eventId, 'arrival'),
    ]);
  } else {
    // Validate manually selected gates
    if (departureGateId) {
      const isValidDepartureGate = await validateGateSelection(
        data.eventId,
        departureGateId,
        'departure'
      );
      if (!isValidDepartureGate) {
        throw new Error('Selected departure gate is not available');
      }
    }

    if (arrivalGateId) {
      const isValidArrivalGate = await validateGateSelection(
        data.eventId,
        arrivalGateId,
        'arrival'
      );
      if (!isValidArrivalGate) {
        throw new Error('Selected arrival gate is not available');
      }
    }
  }

  // Check if any gates are available
  const hasAnyGates = await getEventGates(data.eventId);
  const hasDepartureGates = hasAnyGates.some(
    (g) => g.airportType === 'departure'
  );
  const hasArrivalGates = hasAnyGates.some((g) => g.airportType === 'arrival');

  // If there are gates configured but none are available, provide a warning
  if (
    (hasDepartureGates && !departureGateId) ||
    (hasArrivalGates && !arrivalGateId)
  ) {
    // Still allow joining but without gate assignment
    // The user can manually assign gates later if they become available
  }

  const participant = await joinEventMutation(
    data.eventId,
    userId,
    departureGateId || undefined,
    arrivalGateId || undefined
  );
  if (!participant) {
    throw new Error('Failed to join event');
  }

  return participant;
}

export async function leaveEventRecord(
  data: LeaveEventData,
  userId: string
): Promise<boolean> {
  const event = await getEventById(data.eventId);
  if (!event) {
    throw new Error('Event not found');
  }

  const existingParticipant = await getEventParticipants(data.eventId);
  const userParticipant = existingParticipant.find((p) => p.userId === userId);

  if (!userParticipant) {
    throw new Error('You are not participating in this event');
  }

  // Release gates if they were assigned
  if (userParticipant.departureGateId || userParticipant.arrivalGateId) {
    await db
      .update(eventParticipants)
      .set({
        departureGateId: null,
        arrivalGateId: null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(eventParticipants.eventId, data.eventId),
          eq(eventParticipants.userId, userId)
        )
      );
  }

  const success = await leaveEventMutation(data.eventId, userId);
  if (!success) {
    throw new Error('Failed to leave event');
  }

  return true;
}

export async function assignGateToParticipantRecord(
  data: AssignGateData,
  userId: string
): Promise<EventParticipant> {
  const event = await getEventById(data.eventId);
  if (!event) {
    throw new Error('Event not found');
  }

  const participant = await getEventParticipants(data.eventId);
  const userParticipant = participant.find((p) => p.userId === userId);

  if (!userParticipant) {
    throw new Error('You are not participating in this event');
  }

  const gates = await getEventGatesByType(data.eventId, data.gateType);
  const gateExists = gates.some((g) => g.id === data.gateId);

  if (!gateExists) {
    throw new Error('Gate not found');
  }

  const updatedParticipant = await assignGateToParticipantMutation(
    data.eventId,
    userId,
    data.gateId,
    data.gateType
  );

  if (!updatedParticipant) {
    throw new Error('Failed to assign gate');
  }

  return updatedParticipant;
}

export async function unassignGateFromParticipantRecord(
  data: AssignGateData,
  userId: string
): Promise<EventParticipant> {
  const event = await getEventById(data.eventId);
  if (!event) {
    throw new Error('Event not found');
  }

  const participant = await getEventParticipants(data.eventId);
  const userParticipant = participant.find((p) => p.userId === userId);

  if (!userParticipant) {
    throw new Error('You are not participating in this event');
  }

  const updatedParticipant = await unassignGateFromParticipantMutation(
    data.eventId,
    userId,
    data.gateType
  );

  if (!updatedParticipant) {
    throw new Error('Failed to unassign gate');
  }

  return updatedParticipant;
}

export async function joinEvent(
  data: JoinEventData,
  userId: string
): Promise<EventParticipant> {
  return joinEventRecord(data, userId);
}

export async function leaveEvent(
  data: LeaveEventData,
  userId: string
): Promise<boolean> {
  return leaveEventRecord(data, userId);
}

export async function assignGateToParticipant(
  data: AssignGateData,
  userId: string
): Promise<EventParticipant> {
  return assignGateToParticipantRecord(data, userId);
}

export async function unassignGateFromParticipant(
  data: AssignGateData,
  userId: string
): Promise<EventParticipant> {
  return unassignGateFromParticipantRecord(data, userId);
}

// Admin-specific schemas and operations
const _adminAssignGateSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  targetUserId: z.string().min(1, 'Target user ID is required'),
  gateId: z.union([
    z.string().min(1, 'Gate ID is required'),
    z.literal('__unassign__'),
  ]),
  gateType: z.enum(['departure', 'arrival']),
});

const _adminRemoveParticipantSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  targetUserId: z.string().min(1, 'Target user ID is required'),
});

export type AdminAssignGateData = z.infer<typeof _adminAssignGateSchema>;
export type AdminRemoveParticipantData = z.infer<
  typeof _adminRemoveParticipantSchema
>;

export async function adminAssignGateToParticipantRecord(
  data: AdminAssignGateData
): Promise<EventParticipant> {
  const event = await getEventById(data.eventId);
  if (!event) {
    throw new Error('Event not found');
  }

  const participants = await getEventParticipants(data.eventId);
  const target = participants.find((p) => p.userId === data.targetUserId);
  if (!target) {
    throw new Error('Target user is not participating in this event');
  }

  // Handle unassigning
  if (data.gateId === '__unassign__') {
    const updateField =
      data.gateType === 'departure'
        ? { departureGateId: null as string | null }
        : { arrivalGateId: null as string | null };

    const updated = await db
      .update(eventParticipants)
      .set({ ...updateField, updatedAt: new Date() })
      .where(
        and(
          eq(eventParticipants.eventId, data.eventId),
          eq(eventParticipants.userId, data.targetUserId)
        )
      )
      .returning();

    if (!updated[0]) {
      throw new Error('Failed to unassign gate');
    }

    return updated[0];
  }

  const gates = await getEventGatesByType(data.eventId, data.gateType);
  const gateExists = gates.some((g) => g.id === data.gateId);
  if (!gateExists) {
    throw new Error('Gate not found');
  }

  // Free the gate from any other participant first (reassign semantics)
  const updateField =
    data.gateType === 'departure'
      ? { departureGateId: null as string | null }
      : { arrivalGateId: null as string | null };

  await db
    .update(eventParticipants)
    .set({ ...updateField, updatedAt: new Date() })
    .where(
      and(
        eq(eventParticipants.eventId, data.eventId),
        data.gateType === 'departure'
          ? eq(eventParticipants.departureGateId, data.gateId)
          : eq(eventParticipants.arrivalGateId, data.gateId)
      )
    );

  const updated = await assignGateToParticipantMutation(
    data.eventId,
    data.targetUserId,
    data.gateId,
    data.gateType
  );

  if (!updated) {
    throw new Error('Failed to assign gate');
  }

  return updated;
}

export async function adminRemoveParticipantFromEventRecord(
  data: AdminRemoveParticipantData
): Promise<boolean> {
  const event = await getEventById(data.eventId);
  if (!event) {
    throw new Error('Event not found');
  }

  await db
    .delete(eventParticipants)
    .where(
      and(
        eq(eventParticipants.eventId, data.eventId),
        eq(eventParticipants.userId, data.targetUserId)
      )
    );

  return true;
}

async function validateGateSelection(
  eventId: string,
  gateId: string,
  gateType: 'departure' | 'arrival'
): Promise<boolean> {
  // Check if the gate exists and is of the correct type
  const gates = await getEventGatesByType(eventId, gateType);
  const gate = gates.find((g) => g.id === gateId);
  if (!gate) {
    return false;
  }

  // Check if the gate is already assigned to another participant
  const participants = await getEventParticipants(eventId);
  const isAssigned = participants.some((p) => {
    if (gateType === 'departure') {
      return p.departureGateId === gateId;
    } else {
      return p.arrivalGateId === gateId;
    }
  });

  return !isAssigned;
}
