'use client';

import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { toast } from 'sonner';

import { updateLeaveStatusAction } from '@/actions/leave/update-leave-status';
import { StatusButton } from '@/components/ui/status-button';

interface LeaveRequestActionsProps {
  leaveRequestId: string;
  currentStatus?: 'pending' | 'approved' | 'denied';
}

export function LeaveRequestActions({
  leaveRequestId,
  currentStatus,
}: LeaveRequestActionsProps) {
  const router = useRouter();

  const { execute: approveRequest, isPending: isApproving } = useAction(
    updateLeaveStatusAction,
    {
      onSuccess: () => {
        toast.success('Leave request approved successfully!');
        router.refresh();
      },
      onError: (error) => {
        toast.error(
          error.error.serverError || 'Failed to approve leave request'
        );
      },
    }
  );

  const { execute: rejectRequest, isPending: isRejecting } = useAction(
    updateLeaveStatusAction,
    {
      onSuccess: () => {
        toast.success('Leave request denied successfully!');
        router.refresh();
      },
      onError: (error) => {
        toast.error(error.error.serverError || 'Failed to deny leave request');
      },
    }
  );

  const handleApprove = () => {
    approveRequest({
      leaveRequestId,
      status: 'approved',
    });
  };

  const handleReject = () => {
    rejectRequest({
      leaveRequestId,
      status: 'denied',
    });
  };

  return (
    <div className="flex gap-2">
      <StatusButton
        status="denied"
        onClick={handleReject}
        disabled={
          isApproving ||
          isRejecting ||
          (currentStatus !== undefined && currentStatus === 'denied')
        }
      >
        {isRejecting ? 'Denying...' : 'Deny Request'}
      </StatusButton>
      <StatusButton
        status="approved"
        onClick={handleApprove}
        disabled={
          isApproving ||
          isRejecting ||
          (currentStatus !== undefined && currentStatus === 'approved')
        }
      >
        {isApproving ? 'Approving...' : 'Approve Request'}
      </StatusButton>
    </div>
  );
}
