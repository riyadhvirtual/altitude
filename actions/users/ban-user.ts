'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { banUser } from '@/domains/users/ban-user';
import { handleDbError } from '@/lib/db-error';
import { createRoleActionClient } from '@/lib/safe-action';

const banUserSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  reason: z
    .string()
    .min(1, 'Reason is required')
    .max(500, 'Reason must be less than 500 characters'),
  expiresAt: z.date().optional(),
});

export const banUserAction = createRoleActionClient(['users'])
  .inputSchema(banUserSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { userId, reason, expiresAt } = parsedInput;

    try {
      await banUser(userId, reason, expiresAt, ctx.userRoles);

      revalidatePath('/admin/users');
      revalidatePath(`/admin/users/${userId}`);

      return {
        success: true,
        message: 'User banned successfully',
      };
    } catch (error) {
      handleDbError(error, {
        fallback: 'Failed to ban user',
      });
    }
  });
