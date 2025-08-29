'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { deleteAvatar, uploadAvatar } from '@/domains/account/upload-avatar';
import { handleDbError } from '@/lib/db-error';
import { authActionClient } from '@/lib/safe-action';

const schema = z.object({
  userId: z.string().min(1, 'User ID required'),
  file: z.instanceof(File, { message: 'File required' }),
});

export const uploadAvatarAction = authActionClient
  .inputSchema(schema)
  .action(async ({ parsedInput }) => {
    const { userId, file } = parsedInput;

    try {
      const url = await uploadAvatar({ userId, file });

      revalidatePath('/admin/users');
      revalidatePath(`/admin/users/${userId}`);

      return { success: true, message: 'Avatar updated', url };
    } catch (error) {
      handleDbError(error, {
        fallback: 'Failed to upload avatar',
      });
    }
  });

const resetAvatarSchema = z.object({
  userId: z.string().min(1, 'User ID required'),
});

export const resetAvatarAction = authActionClient
  .inputSchema(resetAvatarSchema)
  .action(async ({ parsedInput }) => {
    const { userId } = parsedInput;

    try {
      await deleteAvatar(userId);

      revalidatePath('/admin/users');
      revalidatePath(`/admin/users/${userId}`);

      return { success: true, message: 'Avatar reset' };
    } catch (error) {
      handleDbError(error, {
        fallback: 'Failed to reset avatar',
      });
    }
  });
