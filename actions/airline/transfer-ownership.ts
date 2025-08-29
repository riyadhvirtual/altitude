'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { transferOwnership } from '@/domains/airline/transfer-ownership';
import { handleDbError } from '@/lib/db-error';
import { ownerActionClient } from '@/lib/safe-action';

const transferOwnershipSchema = z.object({
  newOwnerId: z.string().min(1, 'New owner ID is required'),
});

export const transferOwnershipAction = ownerActionClient
  .inputSchema(transferOwnershipSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { newOwnerId } = parsedInput;
    const previousOwner = ctx.userId;

    if (!previousOwner) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    try {
      await transferOwnership({ newOwnerId, previousOwner });

      revalidatePath('/admin/airline');

      return {
        success: true,
        message: 'Ownership transferred successfully',
      };
    } catch (error) {
      handleDbError(error, {
        fallback: 'Failed to transfer ownership',
      });
    }
  });
