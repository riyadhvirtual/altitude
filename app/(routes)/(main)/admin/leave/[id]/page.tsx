import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { LeaveRequestActions } from '@/components/leave/leave-actions';
import { LeaveDetails } from '@/components/leave/leave-details';
import { getLeaveRequestById } from '@/db/queries';
import { requireRole } from '@/lib/auth-check';

export function generateMetadata(): Metadata {
  return {
    title: 'Leave Request Details',
  };
}

interface LeaveRequestDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function LeaveRequestDetailsPage({
  params,
}: LeaveRequestDetailsPageProps) {
  await requireRole(['users']);

  const { id } = await params;
  const leaveRequest = await getLeaveRequestById(id);

  if (!leaveRequest) {
    notFound();
  }

  return (
    <LeaveDetails
      leaveRequest={leaveRequest}
      isAdmin={true}
      adminActionButtons={
        <LeaveRequestActions
          leaveRequestId={leaveRequest.id}
          currentStatus={
            leaveRequest.status as 'pending' | 'approved' | 'denied'
          }
        />
      }
      backHref="/admin/leave"
      backLabel="Back to Leave Requests"
    />
  );
}
