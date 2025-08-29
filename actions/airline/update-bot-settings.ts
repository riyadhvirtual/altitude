'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import {
  BotSettingsUpdateData,
  updateBotSettings,
} from '@/domains/airline/update-bot-settings';
import { handleDbError } from '@/lib/db-error';
import { createRoleActionClient } from '@/lib/safe-action';

const updateBotSettingsSchema = z.object({
  botToken: z.string().optional(),
  clientId: z.string().optional(),
});

export const updateBotSettingsAction = createRoleActionClient(['admin'])
  .inputSchema(updateBotSettingsSchema)
  .action(async ({ parsedInput }) => {
    const { botToken, clientId } = parsedInput;

    try {
      await updateBotSettings({
        botToken,
        clientId,
      } as BotSettingsUpdateData);

      revalidatePath('/admin/settings');

      return {
        success: true,
        message: 'Discord bot settings updated successfully',
      };
    } catch (error) {
      handleDbError(error, {
        constraint: 'Cannot update bot settings due to existing dependencies',
        fallback: 'Failed to update Discord bot settings',
      });
    }
  });
