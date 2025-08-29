'use server';

import { revalidatePath } from 'next/cache';

import { updateUserAccount } from '@/domains/account/update-account';
import { extractDbErrorMessage } from '@/lib/db-error';
import { authActionClient } from '@/lib/safe-action';
import { accountUpdateSchema as updateAccountSchema } from '@/lib/validation/account';

export const updateAccountAction = authActionClient
  .inputSchema(updateAccountSchema)
  .action(async ({ parsedInput, ctx: { userId } }) => {
    try {
      await updateUserAccount({ userId, ...parsedInput });
      revalidatePath('/account');
      return { success: true, message: 'Account updated successfully' };
    } catch (error) {
      const errorMessage = extractDbErrorMessage(error, {
        unique: {
          email: 'Email is already in use by another account',
          name: 'Name is already in use by another user',
          discordUsername: 'Discord username already in use',
          discourseUsername: 'Discourse username already in use',
        },
        fallback: 'Failed to update account',
      });
      return { success: false, error: errorMessage };
    }
  });
