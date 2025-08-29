'use client';

import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { toast } from 'sonner';

import { createEventAction } from '@/actions/events/create-event';
import { EventForm } from '@/components/events/event-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { type Aircraft, type Multiplier } from '@/db/schema';
import { useResponsiveDialog } from '@/hooks/use-responsive-dialog';
import {
  ActionErrorResponse,
  extractActionErrorMessage,
} from '@/lib/error-handler';

interface CreateEventDialogProps {
  children: React.ReactNode;
  aircraft: Aircraft[];
  multipliers: Multiplier[];
}

export default function CreateEventDialog({
  children,
  aircraft,
  multipliers,
}: CreateEventDialogProps) {
  const [open, setOpen] = useState(false);
  const { dialogStyles } = useResponsiveDialog({
    maxWidth: 'sm:max-w-[800px]',
  });

  const { execute, isPending } = useAction(createEventAction, {
    onSuccess: ({ data }) => {
      const result = data as
        | {
            success?: boolean;
            message?: string;
            error?: string;
          }
        | undefined;

      if (result?.success) {
        toast.success(result.message || 'Event created successfully');
        setOpen(false);
        return;
      }

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Event created successfully');
      setOpen(false);
    },
    onError: (errorResponse) => {
      const errorMessage = extractActionErrorMessage(
        errorResponse as ActionErrorResponse,
        'Failed to create event'
      );
      toast.error(errorMessage);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className={dialogStyles.className}
        style={dialogStyles.style}
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle className="text-foreground">Create Event</DialogTitle>
          <DialogDescription className="text-foreground">
            Create a new event for pilots to participate in.
          </DialogDescription>
        </DialogHeader>
        <EventForm
          aircraft={aircraft}
          multipliers={multipliers}
          onSubmit={(data, imageFile) => {
            execute({
              ...data,
              departureTime: new Date(data.departureTime!),
              multiplierId: data.multiplierId ?? undefined,
              imageFile: imageFile ?? undefined,
              status: data.status,
            });
          }}
          isSubmitting={isPending}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
