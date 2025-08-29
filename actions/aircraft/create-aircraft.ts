'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createAircraftRecord } from '@/domains/aircraft/create-aircraft';
import { extractDbErrorMessage } from '@/lib/db-error';
import { createRoleActionClient } from '@/lib/safe-action';

const createAircraftSchema = z.object({
  name: z
    .string()
    .min(1, 'Aircraft name is required')
    .max(100, 'Aircraft name must be less than 100 characters')
    .trim(),
  livery: z
    .string()
    .min(1, 'Livery is required')
    .max(100, 'Livery must be less than 100 characters')
    .trim(),
  aircraftID: z.string().optional(),
});

export const createAircraftAction = createRoleActionClient(['fleet'])
  .inputSchema(createAircraftSchema)
  .action(async ({ parsedInput }) => {
    const { name, livery } = parsedInput;

    try {
      const newAircraft = await createAircraftRecord(name, livery);

      revalidatePath('/admin/fleet');
      revalidatePath('/fleet');

      return {
        success: true,
        message: 'Aircraft created successfully',
        aircraft: newAircraft,
      };
    } catch (error) {
      const errorMessage = extractDbErrorMessage(error, {
        unique: {
          'aircraft.name, aircraft.livery':
            'An aircraft with this name and livery combination already exists',
        },
        constraint: 'Cannot create aircraft due to data constraints',
        notNull: 'Required aircraft information is missing',
        fallback: 'Failed to create aircraft',
      });

      return {
        success: false,
        error: errorMessage,
      };
    }
  });
