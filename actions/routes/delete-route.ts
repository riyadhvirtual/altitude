'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { deleteRoute } from '@/domains/routes/delete-route';
import { handleDbError } from '@/lib/db-error';
import { createRoleActionClient } from '@/lib/safe-action';

const deleteSchema = z.object({ id: z.string() });

export const deleteRouteAction = createRoleActionClient(['routes'])
  .inputSchema(deleteSchema)
  .action(async ({ parsedInput }) => {
    const { id } = parsedInput;

    try {
      await deleteRoute(id);

      revalidatePath('/admin/routes');

      return { success: true, message: 'Route deleted' } as const;
    } catch (error) {
      handleDbError(error, {
        fallback: 'Failed to delete route',
        constraint:
          'Cannot delete route - it is being used in existing records',
        reference:
          'Cannot delete route - it has associated data that must be removed first',
      });
    }
  });
