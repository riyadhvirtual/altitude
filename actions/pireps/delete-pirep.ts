'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { deletePirep } from '@/domains/pireps/delete-pirep';
import { handleDbError } from '@/lib/db-error';
import { authActionClient } from '@/lib/safe-action';

const deletePirepSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

export const deletePirepAction = authActionClient
  .inputSchema(deletePirepSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { id: pirepId } = parsedInput;

    try {
      await deletePirep(pirepId, ctx.userId ?? '', ctx.session.user.role ?? '');

      revalidatePath('/pireps');
      revalidatePath('/admin/pireps');

      return {
        success: true,
        message: 'PIREP deleted successfully',
      };
    } catch (error) {
      handleDbError(error, {
        fallback: 'Failed to delete PIREP',
      });
    }
  });
