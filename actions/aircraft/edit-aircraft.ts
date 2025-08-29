'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { editAircraftRecord } from '@/domains/aircraft/edit-aircraft';
import { extractDbErrorMessage } from '@/lib/db-error';
import { createRoleActionClient } from '@/lib/safe-action';

const editAircraftSchema = z.object({
  id: z.string(),
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
});

export const editAircraftAction = createRoleActionClient(['fleet'])
  .inputSchema(editAircraftSchema)
  .action(async ({ parsedInput: { id, name, livery } }) => {
    try {
      await editAircraftRecord({ id, name, livery });

      revalidatePath('/admin/fleet');
      revalidatePath('/fleet');

      return {
        success: true,
        message: 'Aircraft updated successfully',
      } as const;
    } catch (error) {
      const errorMessage = extractDbErrorMessage(error, {
        unique: {
          'aircraft.name, aircraft.livery':
            'An aircraft with this name and livery combination already exists',
        },
        constraint: 'Cannot update aircraft due to data constraints',
        notNull: 'Required aircraft information is missing',
        fallback: 'Failed to update aircraft',
      });

      return {
        success: false,
        error: errorMessage,
      };
    }
  });
