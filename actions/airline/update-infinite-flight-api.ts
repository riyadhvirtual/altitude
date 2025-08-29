'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { updateInfiniteFlightApi } from '@/domains/airline/update-infinite-flight-api';
import { handleDbError } from '@/lib/db-error';
import { encrypt } from '@/lib/encryption';
import { createRoleActionClient } from '@/lib/safe-action';

const updateInfiniteFlightApiSchema = z.object({
  id: z.string(),
  infiniteFlightApiKey: z
    .string()
    .min(1, 'API Key is required')
    .max(255, 'API Key must be less than 255 characters')
    .optional(),
});

export const updateInfiniteFlightApiAction = createRoleActionClient(['admin'])
  .inputSchema(updateInfiniteFlightApiSchema)
  .action(async ({ parsedInput }) => {
    const { id, infiniteFlightApiKey } = parsedInput;

    try {
      const encryptedApiKey = infiniteFlightApiKey
        ? encrypt(infiniteFlightApiKey)
        : undefined;

      await updateInfiniteFlightApi({
        id,
        infiniteFlightApiKey: encryptedApiKey,
      });

      revalidatePath('/admin/settings');

      return {
        success: true,
        message: 'Infinite Flight API settings updated successfully',
      };
    } catch (error) {
      handleDbError(error, {
        fallback: 'Failed to update Infinite Flight API settings',
      });
    }
  });
