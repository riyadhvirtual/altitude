'use server';

import { z } from 'zod';

import { getEventAircraft, getEventById, getEventGates } from '@/db/queries';
import { authActionClient } from '@/lib/safe-action';

const getEventDetailsSchema = z.object({
  eventId: z.string(),
});

export const getEventDetailsAction = authActionClient
  .inputSchema(getEventDetailsSchema)
  .action(async ({ parsedInput }) => {
    try {
      const [event, aircraft, gates] = await Promise.all([
        getEventById(parsedInput.eventId),
        getEventAircraft(parsedInput.eventId),
        getEventGates(parsedInput.eventId),
      ]);

      if (!event) {
        return {
          success: false,
          error: 'Event not found',
        };
      }

      return {
        success: true,
        data: { event, aircraft, gates },
      };
    } catch {
      return {
        success: false,
        error: 'Failed to fetch event details',
      };
    }
  });
