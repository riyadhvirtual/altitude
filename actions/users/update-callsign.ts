'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { updateCallsign } from '@/domains/users/update-callsign';
import { handleDbError } from '@/lib/db-error';
import { createRoleActionClient } from '@/lib/safe-action';

const updateCallsignSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  callsign: z.number().int().min(1, 'Callsign must be a positive number'),
});

export const updateCallsignAction = createRoleActionClient(['users'])
  .inputSchema(updateCallsignSchema)
  .action(async ({ parsedInput }) => {
    const { userId, callsign } = parsedInput;

    try {
      await updateCallsign({ userId, callsign });

      revalidatePath('/admin/users');
      revalidatePath(`/admin/users/${userId}`);

      return {
        success: true,
        message: 'Callsign updated successfully',
      };
    } catch (error) {
      // Surface validation errors from domain logic directly
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes('callsign must be between')
      ) {
        throw new Error(error.message);
      }

      handleDbError(error, {
        unique: {
          callsign: 'Callsign is already taken',
        },
        fallback: 'Failed to update callsign',
      });
    }
  });
