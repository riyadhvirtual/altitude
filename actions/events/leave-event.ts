'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { leaveEvent } from '@/domains/events/join-event';
import { handleDbError } from '@/lib/db-error';
import { authActionClient } from '@/lib/safe-action';

const leaveEventSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
});

export const leaveEventAction = authActionClient
  .inputSchema(leaveEventSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      await leaveEvent(parsedInput, ctx.userId);

      revalidatePath('/events');
      revalidatePath(`/events/${parsedInput.eventId}`);
      revalidatePath(`/admin/events/${parsedInput.eventId}`);

      return {
        success: true,
        message: 'Successfully left event',
      };
    } catch (error) {
      handleDbError(error, {
        fallback: 'Failed to leave event',
      });
    }
  });
