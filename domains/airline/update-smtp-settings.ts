import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { airline } from '@/db/schema';

export interface SmtpSettingsUpdateData {
  id: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUsername?: string;
  smtpPassword?: string;
  smtpFromEmail?: string;
  smtpFromName: string;
  smtpSecure?: boolean;
}

export async function updateSmtpSettings(
  data: SmtpSettingsUpdateData
): Promise<void> {
  const existingAirline = await db
    .select({ id: airline.id })
    .from(airline)
    .where(eq(airline.id, data.id))
    .get();

  if (!existingAirline) {
    throw new Error('Airline not found');
  }

  const updateData: Partial<typeof airline.$inferInsert> = {
    smtpFromName: data.smtpFromName,
    updatedAt: new Date(),
  };

  if (data.smtpHost !== undefined) {
    updateData.smtpHost = data.smtpHost;
  }
  if (data.smtpPort !== undefined) {
    updateData.smtpPort = data.smtpPort;
  }
  if (data.smtpUsername !== undefined) {
    updateData.smtpUsername = data.smtpUsername;
  }
  if (data.smtpFromEmail !== undefined) {
    updateData.smtpFromEmail = data.smtpFromEmail;
  }
  if (data.smtpSecure !== undefined) {
    updateData.smtpSecure = data.smtpSecure;
  }
  if (data.smtpPassword !== undefined) {
    updateData.smtpPassword = data.smtpPassword;
  }

  const result = await db
    .update(airline)
    .set(updateData)
    .where(eq(airline.id, data.id));

  if (result.rowsAffected === 0) {
    throw new Error('Failed to update SMTP settings - no changes made');
  }
}
