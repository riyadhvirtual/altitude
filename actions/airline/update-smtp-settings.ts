'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { updateSmtpSettings } from '@/domains/airline/update-smtp-settings';
import { handleDbError } from '@/lib/db-error';
import { encrypt } from '@/lib/encryption';
import { createRoleActionClient } from '@/lib/safe-action';

// Future-proofing for when we have multiple tenants
const usesAltitudeSubdomain =
  process.env.TENANT_USES_ALTITUDE_SUBDOMAIN === 'true';

const fullSchema = z.object({
  id: z.string(),
  smtpHost: z
    .string()
    .min(1, 'SMTP Host is required')
    .max(255, 'SMTP Host must be less than 255 characters')
    .trim(),
  smtpPort: z
    .number()
    .int('Port must be an integer')
    .min(1, 'Port must be at least 1')
    .max(65535, 'Port must be less than 65536'),
  smtpUsername: z
    .string()
    .min(1, 'Username is required')
    .max(255, 'Username must be less than 255 characters')
    .trim(),
  smtpPassword: z
    .string()
    .min(1, 'Password is required')
    .max(255, 'Password must be less than 255 characters')
    .optional(),
  smtpFromEmail: z
    .string()
    .trim()
    .max(255, 'Email must be less than 255 characters')
    .pipe(z.email('Invalid email address')),
  smtpFromName: z
    .string()
    .min(1, 'From name is required')
    .max(255, 'From name must be less than 255 characters')
    .trim(),
  smtpSecure: z.boolean(),
});

const subdomainSchema = fullSchema.pick({ id: true, smtpFromName: true });

const updateSmtpSettingsSchema = usesAltitudeSubdomain
  ? subdomainSchema
  : fullSchema;

export const updateSmtpSettingsAction = createRoleActionClient(['admin'])
  .inputSchema(updateSmtpSettingsSchema)
  .action(async ({ parsedInput }) => {
    try {
      if (usesAltitudeSubdomain) {
        const { id, smtpFromName } = parsedInput as z.infer<
          typeof subdomainSchema
        >;
        await updateSmtpSettings({ id, smtpFromName });
      } else {
        const {
          id,
          smtpHost,
          smtpPort,
          smtpUsername,
          smtpPassword,
          smtpFromEmail,
          smtpFromName,
          smtpSecure,
        } = parsedInput as z.infer<typeof fullSchema>;

        const encryptedPassword = smtpPassword
          ? encrypt(smtpPassword)
          : undefined;

        await updateSmtpSettings({
          id,
          smtpHost,
          smtpPort,
          smtpUsername,
          smtpPassword: encryptedPassword,
          smtpFromEmail,
          smtpFromName,
          smtpSecure,
        });
      }

      revalidatePath('/admin/settings');

      return {
        success: true,
        message: 'SMTP settings updated successfully',
      };
    } catch (error) {
      handleDbError(error, {
        fallback: 'Failed to update SMTP settings',
      });
    }
  });
