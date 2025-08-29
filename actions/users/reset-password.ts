'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { resetUserPassword } from '@/domains/users/reset-password';
import { handleDbError } from '@/lib/db-error';
import { createRoleActionClient } from '@/lib/safe-action';

const resetPasswordSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

export const resetPasswordAction = createRoleActionClient(['users'])
  .inputSchema(resetPasswordSchema)
  .action(async ({ parsedInput }) => {
    const { userId } = parsedInput;

    try {
      const tempPassword = await resetUserPassword(userId);

      revalidatePath(`/admin/users/${userId}`);

      return {
        success: true,
        message: 'Password reset successfully',
        tempPassword,
      };
    } catch (error) {
      handleDbError(error, {
        fallback: 'Failed to reset password',
      });
    }
  });
