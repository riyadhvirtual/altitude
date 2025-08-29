'use client';

import { Loader2 } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { toast } from 'sonner';

import { joinEventAction } from '@/actions/events/join-event';
import { leaveEventAction } from '@/actions/events/leave-event';
import type { EventGate } from '@/db/schema';
import { extractErrorMessage } from '@/lib/error-handler';

import { GateSelectionDialog } from './gate-selection-dialog';

interface JoinLeaveButtonProps {
  eventId: string;
  isParticipating: boolean;
  eventGates: EventGate[];
}

export function JoinLeaveButton({
  eventId,
  isParticipating,
  eventGates,
}: JoinLeaveButtonProps) {
  const [showGateDialog, setShowGateDialog] = useState(false);

  const { execute: joinEvent, isExecuting: joining } = useAction(
    joinEventAction,
    {
      onSuccess: ({ data }) => {
        toast.success(data?.message || 'Joined event');
        setShowGateDialog(false);
      },
      onError: (errorResponse) => {
        toast.error(extractErrorMessage(errorResponse));
      },
    }
  );

  const { execute: leaveEvent, isExecuting: leaving } = useAction(
    leaveEventAction,
    {
      onSuccess: ({ data }) => {
        toast.success(data?.message || 'Left event');
      },
      onError: (errorResponse) => {
        toast.error(extractErrorMessage(errorResponse));
      },
    }
  );

  const handleClick = () => {
    if (isParticipating) {
      leaveEvent({ eventId });
    } else {
      if (eventGates.length > 0) {
        setShowGateDialog(true);
      } else {
        joinEvent({ eventId });
      }
    }
  };

  const handleJoinWithGates = (
    departureGateId?: string,
    arrivalGateId?: string
  ) => {
    joinEvent({
      eventId,
      departureGateId,
      arrivalGateId,
    });
  };

  const isLoading = joining || leaving;

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isParticipating ? (
          'Leave'
        ) : (
          'Join'
        )}
      </button>

      <GateSelectionDialog
        open={showGateDialog}
        onOpenChange={setShowGateDialog}
        eventGates={eventGates}
        onJoin={handleJoinWithGates}
        isLoading={joining}
      />
    </>
  );
}
