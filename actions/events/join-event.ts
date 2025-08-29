'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { joinEvent } from '@/domains/events/join-event';
import { handleDbError } from '@/lib/db-error';
import { authActionClient } from '@/lib/safe-action';

const joinEventSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  departureGateId: z.string().optional(),
  arrivalGateId: z.string().optional(),
});

export const joinEventAction = authActionClient
  .inputSchema(joinEventSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const participant = await joinEvent(parsedInput, ctx.userId);

      revalidatePath('/events');
      revalidatePath(`/events/${parsedInput.eventId}`);
      revalidatePath(`/admin/events/${parsedInput.eventId}`);

      // Determine message based on gate assignment
      let message = 'Successfully joined event';
      if (parsedInput.departureGateId || parsedInput.arrivalGateId) {
        const gateInfo = [];
        if (parsedInput.departureGateId) {
          gateInfo.push('departure gate selected');
        }
        if (parsedInput.arrivalGateId) {
          gateInfo.push('arrival gate selected');
        }
        message = `Successfully joined event with ${gateInfo.join(' and ')}`;
      } else if (!participant.departureGateId && !participant.arrivalGateId) {
        message =
          'Successfully joined event (no gates available for automatic assignment)';
      } else if (!participant.departureGateId || !participant.arrivalGateId) {
        message =
          'Successfully joined event (some gates were automatically assigned)';
      } else {
        message = 'Successfully joined event with automatic gate assignment';
      }

      return {
        success: true,
        message,
        participant,
      };
    } catch (error) {
      handleDbError(error, {
        fallback: 'Failed to join event',
      });
    }
  });
