'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { deleteEvent } from '@/domains/events/delete-event';
import { extractDbErrorMessage } from '@/lib/db-error';
import { authActionClient } from '@/lib/safe-action';

const deleteEventSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
});

export const deleteEventAction = authActionClient
  .inputSchema(deleteEventSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      await deleteEvent(parsedInput.eventId, ctx.userId);

      revalidatePath('/events');
      revalidatePath('/admin/events');

      return {
        success: true,
        message: 'Event deleted successfully',
      };
    } catch (error) {
      const errorMessage = extractDbErrorMessage(error, {
        reference:
          'Cannot delete event with existing participants or dependencies',
        fallback: 'Failed to delete event',
      });

      return {
        success: false,
        error: errorMessage,
        message: errorMessage,
      };
    }
  });
