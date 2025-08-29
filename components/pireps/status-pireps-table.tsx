'use client';

import { Check } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  updateBulkPirepStatusAction,
  updatePirepStatusAction,
} from '@/actions/pireps/update-pirep-status';
import { Button } from '@/components/ui/button';
import type { Airline, Pirep, User } from '@/db/schema';

import { PirepActionDialog } from './dialogs/pirep-action-dialog';
import { PirepsList } from './pireps-list';

interface StatusPirepsTableProps {
  pireps: (Pirep & { user: User })[];
  airline: Airline;
  status: 'pending' | 'approved' | 'denied';
  canViewUsers?: boolean;
}

export function StatusPirepsTable({
  pireps,
  airline,
  status,
  canViewUsers = false,
}: StatusPirepsTableProps) {
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedPirep, setSelectedPirep] = useState<Pirep | null>(null);
  const [selectedAction, setSelectedAction] = useState<
    'approved' | 'denied' | null
  >(null);
  const [selectedPirepIds, setSelectedPirepIds] = useState<Set<string>>(
    new Set()
  );

  const { isExecuting } = useAction(updatePirepStatusAction, {
    onSuccess: ({ data }) => {
      toast.success(data?.message || 'PIREP status updated successfully');
      setSelectedPirepIds(new Set());
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to update PIREP status');
    },
  });

  const { isExecuting: isBulkExecuting } = useAction(
    updateBulkPirepStatusAction,
    {
      onSuccess: ({ data }) => {
        toast.success(data?.message || 'PIREPs updated successfully');
        setSelectedPirepIds(new Set());
      },
      onError: ({ error }) => {
        toast.error(error.serverError || 'Failed to update PIREPs');
      },
    }
  );

  const handleStatusUpdate = (
    pirep: Pirep,
    actionStatus: 'approved' | 'denied'
  ) => {
    setSelectedPirep(pirep);
    setSelectedAction(actionStatus);
    setActionDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setActionDialogOpen(false);
    setSelectedPirep(null);
    setSelectedAction(null);
  };

  const handleBulkAction = async () => {
    if (selectedPirepIds.size === 0) {
      return;
    }

    const pirepIds = Array.from(selectedPirepIds);

    await updateBulkPirepStatusAction({
      ids: pirepIds,
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPirepIds(new Set(pireps.map((p) => p.id)));
    } else {
      setSelectedPirepIds(new Set());
    }
  };

  const handleSelectPirep = (pirepId: string, checked: boolean) => {
    const newSelected = new Set(selectedPirepIds);
    if (checked) {
      newSelected.add(pirepId);
    } else {
      newSelected.delete(pirepId);
    }
    setSelectedPirepIds(newSelected);
  };

  const allSelected =
    pireps.length > 0 && pireps.every((p) => selectedPirepIds.has(p.id));
  const someSelected = pireps.some((p) => selectedPirepIds.has(p.id));

  const getEmptyMessage = () => {
    switch (status) {
      case 'pending':
        return 'No pending PIREPs found';
      case 'approved':
        return 'No approved PIREPs found';
      case 'denied':
        return 'No denied PIREPs found';
      default:
        return 'No PIREPs found';
    }
  };

  return (
    <>
      {someSelected && (status === 'pending' || status === 'denied') && (
        <div className="mb-4 flex flex-col gap-3 rounded-md border border-border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground">
              {selectedPirepIds.size} PIREP
              {selectedPirepIds.size === 1 ? '' : 's'} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="approve"
              onClick={handleBulkAction}
              disabled={isExecuting || isBulkExecuting}
              className="flex w-full items-center justify-center gap-2 sm:w-auto"
            >
              <Check className="h-4 w-4" />
              Approve All
            </Button>
          </div>
        </div>
      )}

      <PirepsList
        pireps={pireps}
        airline={airline}
        emptyMessage={getEmptyMessage()}
        isExecuting={isExecuting}
        onStatusUpdate={handleStatusUpdate}
        selectedPirepIds={selectedPirepIds}
        onSelectPirep={handleSelectPirep}
        allSelected={allSelected}
        onSelectAll={handleSelectAll}
        showCheckboxes={status !== 'approved'}
        canViewUsers={canViewUsers}
      />

      <PirepActionDialog
        pirep={selectedPirep}
        action={selectedAction}
        isOpen={actionDialogOpen}
        onClose={handleCloseDialog}
        onSuccess={() => {}}
      />
    </>
  );
}
