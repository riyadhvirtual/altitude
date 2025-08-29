import { notFound } from 'next/navigation';

import { LeaveDetails } from '@/components/leave/leave-details';
import { getLeaveRequestById } from '@/db/queries';
import { authCheck } from '@/lib/auth-check';

export default async function LeaveRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await authCheck();
  const { id } = await params;
  const leaveRequest = await getLeaveRequestById(id);

  if (!leaveRequest || leaveRequest.userId !== session.user.id) {
    notFound();
  }

  return (
    <LeaveDetails
      leaveRequest={leaveRequest}
      backHref="/leave"
      backLabel="Back to Leave Requests"
    />
  );
}
