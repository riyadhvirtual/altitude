'use server';

import { z } from 'zod';

import { upsertAirline } from '@/domains/setup/create-airline';
import { importAirportsIfNeeded } from '@/domains/setup/import-airports';
import { handleDbError } from '@/lib/db-error';
import { logger } from '@/lib/logger';
import { actionClient } from '@/lib/safe-action';

const createAirlineSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Airline name is required')
      .max(100, 'Airline name must be less than 100 characters'),
    callsign: z
      .string()
      .min(1, 'Callsign is required')
      .max(20, 'Callsign must be less than 20 characters')
      .toUpperCase(),
    callsignMinRange: z.number().min(1).max(999999).optional(),
    callsignMaxRange: z.number().min(1).max(999999).optional(),
  })
  .refine(
    (data) => {
      if (data.callsignMinRange && data.callsignMaxRange) {
        return data.callsignMinRange <= data.callsignMaxRange;
      }
      return true;
    },
    {
      message: 'Minimum range must be less than or equal to maximum range',
      path: ['callsignMinRange'],
    }
  );

export const createAirlineAction = actionClient
  .inputSchema(createAirlineSchema)
  .action(async ({ parsedInput }) => {
    const { name, callsign, callsignMinRange, callsignMaxRange } = parsedInput;

    try {
      await upsertAirline({
        name,
        callsign,
        callsignMinRange,
        callsignMaxRange,
      });

      try {
        await importAirportsIfNeeded();
      } catch (error) {
        // Airport import failure should not prevent airline creation
        // Log the error for debugging but continue with the operation
        logger.error(
          { error },
          'Failed to import airports during airline setup'
        );
      }

      return {
        success: true,
        message: 'Airline configuration saved successfully',
      };
    } catch (error) {
      handleDbError(error, {
        fallback: 'Failed to save airline configuration',
      });
    }
  });
