'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { updateUsername } from '@/domains/users/update-username';
import { handleDbError } from '@/lib/db-error';
import { createRoleActionClient } from '@/lib/safe-action';

const updateUsernameSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(30, 'Name must be at most 30 characters'),
});

export const updateUsernameAction = createRoleActionClient(['users'])
  .inputSchema(updateUsernameSchema)
  .action(async ({ parsedInput }) => {
    const { userId, name } = parsedInput;

    try {
      await updateUsername({ userId, name });

      revalidatePath('/admin/users');
      revalidatePath(`/admin/users/${userId}`);

      return {
        success: true,
        message: 'Name updated successfully',
      };
    } catch (error) {
      handleDbError(error, {
        unique: {
          name: 'Name is already taken',
        },
        fallback: 'Failed to update name',
      });
    }
  });
