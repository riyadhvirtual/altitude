'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { transferFlightTime } from '@/domains/pireps/transfer-flight-time';
import { handleDbError } from '@/lib/db-error';
import { createRoleActionClient } from '@/lib/safe-action';
import { formatHoursMinutes } from '@/lib/utils';

const transferFlightTimeSchema = z.object({
  targetUserId: z.string().min(1, 'Target user ID is required'),
  hours: z
    .number()
    .min(0, 'Hours must be non-negative')
    .max(10000, 'Hours must be at most 10000'),
  minutes: z
    .number()
    .min(0, 'Minutes must be non-negative')
    .max(59, 'Minutes must be at most 59'),
});

export const transferFlightTimeAction = createRoleActionClient([
  'pireps',
  'admin',
])
  .inputSchema(transferFlightTimeSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { newPirep, totalMinutes } = await transferFlightTime({
        ...parsedInput,
        performedByUserId: ctx.userId,
      });

      revalidatePath('/admin/users');
      revalidatePath('/admin/pireps');

      return {
        success: true,
        message: `Successfully transferred ${formatHoursMinutes(totalMinutes)} to user`,
        pirep: newPirep,
      };
    } catch (error) {
      handleDbError(error, {
        fallback: 'Failed to transfer flight time',
      });
    }
  });
