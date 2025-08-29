'use server';

import { z } from 'zod';

import { checkCallsignAvailability } from '@/domains/users/check-callsign-availability';
import { actionClient } from '@/lib/safe-action';

const checkCallsignAvailabilitySchema = z.object({
  callsign: z.number().int().min(1, 'Callsign must be a positive number'),
});

export const checkCallsignAvailabilityAction = actionClient
  .inputSchema(checkCallsignAvailabilitySchema)
  .action(async ({ parsedInput }) => {
    const { callsign } = parsedInput;

    try {
      const available = await checkCallsignAvailability(callsign);

      return {
        available,
        callsign,
      };
    } catch {
      throw new Error('Failed to check callsign availability');
    }
  });
