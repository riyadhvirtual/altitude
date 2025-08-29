'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { deleteMultiplier } from '@/domains/multipliers/delete-multiplier';
import { extractDbErrorMessage } from '@/lib/db-error';
import { createRoleActionClient } from '@/lib/safe-action';

const deleteMultiplierSchema = z.object({
  id: z.string().min(1, 'Multiplier ID is required'),
});

export const deleteMultiplierAction = createRoleActionClient(['multipliers'])
  .inputSchema(deleteMultiplierSchema)
  .action(async ({ parsedInput: { id } }) => {
    try {
      const deletedMultiplier = await deleteMultiplier(id);

      revalidatePath('/admin/multipliers');

      return {
        success: true,
        message: 'Multiplier deleted successfully',
        deletedMultiplier,
      };
    } catch (error) {
      const errorMessage = extractDbErrorMessage(error, {
        fallback: 'Failed to delete multiplier',
        constraint:
          'Cannot delete multiplier - it is being used in existing records',
        reference:
          'Cannot delete multiplier - it has associated data that must be removed first',
      });

      return {
        success: false,
        error: errorMessage,
      };
    }
  });
