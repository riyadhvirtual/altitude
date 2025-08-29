'use server';

import { revalidatePath } from 'next/cache';

import { editPirep, editPirepSchema } from '@/domains/pireps/edit-pirep';
import { handleDbError } from '@/lib/db-error';
import { authActionClient } from '@/lib/safe-action';

export const editPirepAction = authActionClient
  .inputSchema(editPirepSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      await editPirep(
        parsedInput,
        ctx.userId ?? '',
        ctx.session.user.role ?? ''
      );

      revalidatePath('/logbook/[id]', 'page');
      revalidatePath('/admin/pireps/[id]', 'page');
      revalidatePath('/logbook');
      revalidatePath('/admin/pireps');

      return {
        success: true,
        message: 'PIREP updated successfully',
      };
    } catch (error) {
      return handleDbError(error, {
        fallback: 'Failed to update PIREP',
      });
    }
  });
