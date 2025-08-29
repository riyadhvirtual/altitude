'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { updateLeaveStatus } from '@/domains/leave/update-leave-status';
import { handleDbError } from '@/lib/db-error';
import { createRoleActionClient } from '@/lib/safe-action';

const updateLeaveStatusSchema = z.object({
  leaveRequestId: z.string().min(1),
  status: z.enum(['approved', 'denied']),
});

export const updateLeaveStatusAction = createRoleActionClient(['users'])
  .inputSchema(updateLeaveStatusSchema)
  .action(async ({ parsedInput }) => {
    try {
      const updatedLeaveRequest = await updateLeaveStatus(parsedInput);

      revalidatePath('/admin/leave');
      revalidatePath(`/admin/leave/${parsedInput.leaveRequestId}`);

      return {
        success: true,
        message: `Leave request ${parsedInput.status} successfully`,
        leaveRequest: updatedLeaveRequest,
      };
    } catch (error) {
      handleDbError(error, {
        fallback: 'Failed to update leave request status',
      });
    }
  });
