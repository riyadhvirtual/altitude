'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { updatePassword } from '@/domains/account/update-password';
import { handleDbError } from '@/lib/db-error';
import { authActionClient } from '@/lib/safe-action';

const updatePasswordSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
});

export const updatePasswordAction = authActionClient
  .inputSchema(updatePasswordSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { password, confirmPassword } = parsedInput;

    const userId = ctx.userId;
    if (!userId) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    try {
      await updatePassword({ userId, password, confirmPassword });

      revalidatePath('/account');

      return {
        success: true,
        message: 'Password updated successfully',
      };
    } catch (error) {
      handleDbError(error, {
        fallback: 'Failed to update password',
      });
    }
  });
