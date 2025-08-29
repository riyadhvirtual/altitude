'use client';

import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { toast } from 'sonner';

import { updatePirepStatusAction } from '@/actions/pireps/update-pirep-status';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ResponsiveDialogFooter } from '@/components/ui/responsive-dialog-footer';
import { StatusButton } from '@/components/ui/status-button';
import { useResponsiveDialog } from '@/hooks/use-responsive-dialog';

interface AdminPirepStatusButtonsProps {
  pirepId: string;
  currentStatus: 'pending' | 'approved' | 'denied';
}

export function AdminPirepStatusButtons({
  pirepId,
  currentStatus,
}: AdminPirepStatusButtonsProps) {
  const { dialogStyles } = useResponsiveDialog();
  const [isLoading, setIsLoading] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showDenyDialog, setShowDenyDialog] = useState(false);
  const [denyReason, setDenyReason] = useState('');

  const { execute } = useAction(updatePirepStatusAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(data.message);
      }
      setIsLoading(false);
      setShowApproveDialog(false);
      setShowDenyDialog(false);
      setDenyReason('');
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to update PIREP status');
      setIsLoading(false);
      setShowApproveDialog(false);
      setShowDenyDialog(false);
      setDenyReason('');
    },
  });

  const handleStatusChange = async (newStatus: 'approved' | 'denied') => {
    if (
      newStatus === 'denied' &&
      (!denyReason || denyReason.trim().length === 0)
    ) {
      toast.error('Denial reason is required');
      return;
    }

    setIsLoading(true);
    if (newStatus === 'denied') {
      execute({
        id: pirepId,
        status: newStatus,
        deniedReason: denyReason.trim(),
      });
    } else {
      execute({
        id: pirepId,
        status: newStatus,
      });
    }
  };

  const handleApproveClick = () => {
    setShowApproveDialog(true);
  };

  const handleDenyClick = () => {
    setShowDenyDialog(true);
  };

  return (
    <>
      <div className="flex gap-2">
        {currentStatus === 'pending' && (
          <>
            <StatusButton
              size="sm"
              status="approved"
              onClick={handleApproveClick}
              disabled={isLoading}
            >
              Approve
            </StatusButton>
            <StatusButton
              size="sm"
              status="denied"
              onClick={handleDenyClick}
              disabled={isLoading}
            >
              Deny
            </StatusButton>
          </>
        )}
        {currentStatus === 'approved' && (
          <StatusButton
            size="sm"
            status="denied"
            onClick={handleDenyClick}
            disabled={isLoading}
          >
            Deny
          </StatusButton>
        )}
        {currentStatus === 'denied' && (
          <StatusButton
            size="sm"
            status="approved"
            onClick={handleApproveClick}
            disabled={isLoading}
          >
            Approve
          </StatusButton>
        )}
      </div>

      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent
          className={dialogStyles.className}
          style={dialogStyles.style}
          showCloseButton
        >
          <DialogHeader>
            <DialogTitle>Approve PIREP</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this PIREP? This action will add
              the flight time to the pilot&apos;s total and mark the flight as
              approved.
            </DialogDescription>
          </DialogHeader>
          <ResponsiveDialogFooter
            primaryButton={{
              label: isLoading ? 'Approving...' : 'Approve',
              onClick: () => handleStatusChange('approved'),
              disabled: isLoading,
              loading: isLoading,
              loadingLabel: 'Approving...',
              className: 'bg-green-600 text-white hover:bg-green-700',
            }}
            secondaryButton={{
              label: 'Cancel',
              onClick: () => setShowApproveDialog(false),
              disabled: isLoading,
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showDenyDialog} onOpenChange={setShowDenyDialog}>
        <DialogContent
          className={dialogStyles.className}
          style={dialogStyles.style}
          showCloseButton
        >
          <DialogHeader>
            <DialogTitle>Deny PIREP</DialogTitle>
            <DialogDescription>
              Are you sure you want to deny this PIREP? This action will remove
              any flight time from this flight and mark it as denied.
            </DialogDescription>
          </DialogHeader>
          <div className="mb-2">
            <label
              htmlFor="deny-reason"
              className="block text-sm font-medium mb-1"
            >
              Reason for denial <span className="text-red-500">*</span>
            </label>
            <textarea
              id="deny-reason"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              rows={2}
              value={denyReason}
              onChange={(e) => setDenyReason(e.target.value)}
              placeholder="Enter reason for denial (required)"
              disabled={isLoading}
              required
            />
          </div>
          <ResponsiveDialogFooter
            primaryButton={{
              label: isLoading ? 'Denying...' : 'Deny',
              onClick: () => handleStatusChange('denied'),
              disabled: isLoading || !denyReason.trim(),
              loading: isLoading,
              loadingLabel: 'Denying...',
              className:
                'bg-destructive text-destructive-foreground hover:bg-destructive/90',
            }}
            secondaryButton={{
              label: 'Cancel',
              onClick: () => {
                setShowDenyDialog(false);
                setDenyReason('');
              },
              disabled: isLoading,
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
