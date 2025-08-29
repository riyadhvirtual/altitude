'use server';

import { after } from 'next/server';
import { z } from 'zod';

import {
  createLeaveRequest,
  sendLeaveRequestWebhookNotification,
} from '@/domains/leave/create-leave-request';
import { handleDbError } from '@/lib/db-error';
import { authActionClient } from '@/lib/safe-action';

const createLeaveRequestSchema = z.object({
  reason: z.string().min(10).max(200),
  startDate: z.date(),
  endDate: z.date(),
});

export const createLeaveRequestAction = authActionClient
  .inputSchema(createLeaveRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const leaveRequest = await createLeaveRequest({
        ...parsedInput,
        userId: ctx.userId,
      });

      after(async () => {
        await sendLeaveRequestWebhookNotification(
          leaveRequest.id,
          parsedInput.reason,
          parsedInput.startDate,
          parsedInput.endDate,
          ctx.userId
        );
      });

      return {
        success: true,
        message: 'Leave request submitted successfully',
        leaveRequest,
      };
    } catch (error) {
      handleDbError(error, {
        fallback: 'Failed to submit leave request',
      });
    }
  });
