'use server';

import { revalidatePath } from 'next/cache';
import { after } from 'next/server';
import { z } from 'zod';

import { getAirline } from '@/db/queries/airline';
import { getUserById } from '@/db/queries/users';
import { verifyUser } from '@/domains/users/verify-user';
import { handleDbError } from '@/lib/db-error';
import { sendApplicationApprovedEmail } from '@/lib/email-utils';
import { createRoleActionClient } from '@/lib/safe-action';

const verifyUserSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

export const verifyUserAction = createRoleActionClient(['users'])
  .inputSchema(verifyUserSchema)
  .action(async ({ parsedInput }) => {
    const { id } = parsedInput;

    try {
      await verifyUser(id);

      const [user, airline] = await Promise.all([
        getUserById(id),
        getAirline(),
      ]);

      after(async () => {
        const usesAltitudeSubdomain =
          process.env.TENANT_USES_ALTITUDE_SUBDOMAIN === 'true';

        const hasSmtpConfig = usesAltitudeSubdomain
          ? Boolean(
              process.env.SMTP_HOST &&
                process.env.SMTP_PORT &&
                process.env.SMTP_USERNAME &&
                process.env.SMTP_PASSWORD &&
                process.env.SMTP_FROM_EMAIL &&
                airline?.smtpFromName
            )
          : Boolean(
              airline?.smtpHost &&
                airline.smtpPort &&
                airline.smtpUsername &&
                airline.smtpPassword &&
                airline.smtpFromEmail &&
                airline.smtpFromName
            );

        if (user && airline && user.callsign && hasSmtpConfig) {
          try {
            await sendApplicationApprovedEmail(
              user.email,
              user.name || 'Pilot'
            );
          } catch {
            // Don't fail the verification if email fails
          }
        }
      });

      revalidatePath('/admin/users');
      revalidatePath('/admin/users/applications');

      return {
        success: true,
        message: 'User verified successfully',
      };
    } catch (error) {
      handleDbError(error, {
        fallback: 'Failed to verify user',
      });
    }
  });
