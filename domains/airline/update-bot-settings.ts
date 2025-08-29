import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/db';
import { discordConfig } from '@/db/schema';
import { decrypt, encrypt, validateEncryptionKey } from '@/lib/encryption';
import { authActionClient } from '@/lib/safe-action';

const updateBotSettingsSchema = z.object({
  botToken: z.string().optional(),
  clientId: z.string().optional(),
});

export interface BotSettingsUpdateData {
  botToken?: string;
  clientId?: string;
}

type UpdateData = {
  updatedAt: Date;
  botToken?: string;
  clientId?: string;
};

async function validateEncryptionKeyExists(): Promise<void> {
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }

  if (!validateEncryptionKey(encryptionKey)) {
    throw new Error('ENCRYPTION_KEY does not meet security requirements');
  }
}

export async function updateBotSettingsRecord(
  data: BotSettingsUpdateData
): Promise<void> {
  if (
    (!data.botToken || data.botToken.trim() === '') &&
    (!data.clientId || data.clientId.trim() === '')
  ) {
    return;
  }

  const updateData: UpdateData = {
    updatedAt: new Date(),
  };

  if (data.botToken && data.botToken.trim() !== '') {
    await validateEncryptionKeyExists();
    updateData.botToken = encrypt(data.botToken);
  }

  if (data.clientId && data.clientId.trim() !== '') {
    updateData.clientId = data.clientId;
  }

  const existingConfig = await db.select().from(discordConfig).get();

  if (existingConfig) {
    const result = await db
      .update(discordConfig)
      .set(updateData)
      .where(eq(discordConfig.id, existingConfig.id));

    if (result.rowsAffected === 0) {
      throw new Error('Failed to update Discord config - no changes made');
    }
  } else {
    await db.insert(discordConfig).values({
      id: crypto.randomUUID(),
      ...updateData,
      createdAt: new Date(),
    });
  }
}

export const updateBotSettings = authActionClient
  .inputSchema(updateBotSettingsSchema)
  .action(async ({ parsedInput }) => {
    await updateBotSettingsRecord(parsedInput);

    // If bot token was provided, try to start/restart the bot through a single manager
    if (parsedInput.botToken && parsedInput.botToken.trim() !== '') {
      try {
        const { BotManager } = await import('@/bot/manager');
        const botManager = BotManager.getInstance();

        const started = await botManager.restart();
        if (!started) {
          throw new Error('Failed to restart Discord bot after token update');
        }
      } catch {
        // Bot startup error is logged by the manager itself
        // We don't throw here to avoid breaking the settings update
      }
    }

    return { success: true };
  });

export async function getDecryptedBotToken(): Promise<string | null> {
  const config = await db.select().from(discordConfig).get();
  if (!config?.botToken) {
    return null;
  }

  try {
    return decrypt(config.botToken);
  } catch {
    return null;
  }
}

export async function getDiscordClientId(): Promise<string | null> {
  const config = await db.select().from(discordConfig).get();
  return config?.clientId || null;
}
