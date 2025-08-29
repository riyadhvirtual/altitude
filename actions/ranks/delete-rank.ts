'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { deleteRank } from '@/domains/ranks/delete-rank';
import { handleDbError } from '@/lib/db-error';
import { createRoleActionClient } from '@/lib/safe-action';

const deleteRankSchema = z.object({
  id: z.string().min(1, 'Rank ID is required'),
});

export const deleteRankAction = createRoleActionClient(['ranks'])
  .inputSchema(deleteRankSchema)
  .action(async ({ parsedInput: { id } }) => {
    try {
      const deletedRank = await deleteRank(id);

      revalidatePath('/admin/ranks');

      return {
        success: true,
        message: 'Rank deleted successfully',
        deletedRank,
      };
    } catch (error) {
      handleDbError(error, {
        fallback: 'Failed to delete rank',
        constraint:
          'Cannot delete rank - it is being used by users or aircraft',
        reference:
          'Cannot delete rank - it has associated data that must be removed first',
      });
    }
  });
