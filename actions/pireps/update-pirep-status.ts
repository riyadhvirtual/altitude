'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import {
  updateBulkPirepStatus,
  updatePirepStatus,
} from '@/domains/pireps/update-pirep-status';
import { handleDbError } from '@/lib/db-error';
import { createRoleActionClient } from '@/lib/safe-action';

const updatePirepStatusSchema = z
  .object({
    id: z.string().min(1, 'ID is required'),
    status: z.enum(['pending', 'approved', 'denied']),
    deniedReason: z
      .string()
      .max(200, 'Denied reason must be at most 200 characters')
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      if (data.status === 'denied') {
        return data.deniedReason && data.deniedReason.trim().length > 0;
      }
      return true;
    },
    {
      message: 'Denied reason is required when status is denied',
      path: ['deniedReason'],
    }
  );

const updateBulkPirepStatusSchema = z.object({
  ids: z
    .array(z.string().min(1, 'ID is required'))
    .min(1, 'At least one PIREP ID is required'),
});

export const updatePirepStatusAction = createRoleActionClient(['pireps'])
  .inputSchema(updatePirepStatusSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { id: pirepId, status: newStatus, deniedReason } = parsedInput;

    try {
      await updatePirepStatus(pirepId, newStatus, ctx.userId, deniedReason);

      revalidatePath('/admin/pireps');

      return {
        success: true,
        message: `PIREP ${newStatus} successfully`,
      };
    } catch (error) {
      handleDbError(error, {
        fallback: 'Failed to update PIREP status',
      });
    }
  });

export const updateBulkPirepStatusAction = createRoleActionClient(['pireps'])
  .inputSchema(updateBulkPirepStatusSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { ids: pirepIds } = parsedInput;

    try {
      const updatedPireps = await updateBulkPirepStatus(pirepIds, ctx.userId);

      revalidatePath('/admin/pireps');

      return {
        success: true,
        message: `${updatedPireps.length} PIREP${updatedPireps.length === 1 ? '' : 's'} approved successfully`,
      };
    } catch (error) {
      handleDbError(error, {
        fallback: 'Failed to update PIREP status',
      });
    }
  });
