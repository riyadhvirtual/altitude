import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { leaveRequests } from '@/db/schema';

interface UpdateLeaveStatusData {
  leaveRequestId: string;
  status: 'approved' | 'denied';
}

export async function updateLeaveStatus({
  leaveRequestId,
  status,
}: UpdateLeaveStatusData) {
  const [updatedLeaveRequest] = await db
    .update(leaveRequests)
    .set({
      status: status,
      updatedAt: new Date(),
    })
    .where(eq(leaveRequests.id, leaveRequestId))
    .returning();

  if (!updatedLeaveRequest) {
    throw new Error('Leave request not found');
  }

  return updatedLeaveRequest;
}
