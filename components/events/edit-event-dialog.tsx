'use client';

import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { getEventDetailsAction } from '@/actions/events/get-event-details';
import { updateEventAction } from '@/actions/events/update-event';
import { EventForm, type EventFormData } from '@/components/events/event-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  type Aircraft,
  type Event,
  type EventAircraft,
  type EventGate,
  type Multiplier,
} from '@/db/schema';
import { useResponsiveDialog } from '@/hooks/use-responsive-dialog';
import {
  ActionErrorResponse,
  extractActionErrorMessage,
} from '@/lib/error-handler';

interface EditEventDialogProps {
  event: Event;
  aircraft: Aircraft[];
  multipliers: Multiplier[];
  onClose: () => void;
}

export default function EditEventDialog({
  event,
  aircraft,
  multipliers,
  onClose,
}: EditEventDialogProps) {
  const [open, setOpen] = useState(true);
  const router = useRouter();
  const { dialogStyles } = useResponsiveDialog({
    maxWidth: 'sm:max-w-[800px]',
  });
  const [eventDetails, setEventDetails] = useState<{
    event: Event;
    aircraft: EventAircraft[];
    gates: EventGate[];
  } | null>(null);

  const { execute, isPending } = useAction(updateEventAction, {
    onSuccess: ({ data }) => {
      const result = data as
        | {
            success?: boolean;
            message?: string;
            error?: string;
          }
        | undefined;

      if (result?.success) {
        toast.success(result.message || 'Event updated successfully');
        setOpen(false);
        onClose();
        router.refresh();
        return;
      }

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Event updated successfully');
      setOpen(false);
      onClose();
      router.refresh();
    },
    onError: (errorResponse) => {
      const errorMessage = extractActionErrorMessage(
        errorResponse as ActionErrorResponse,
        'Failed to update event'
      );
      toast.error(errorMessage);
    },
  });

  const { execute: getEventDetails, isPending: isLoadingDetails } = useAction(
    getEventDetailsAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success && data.data) {
          setEventDetails({
            event: data.data.event,
            aircraft: data.data.aircraft,
            gates: data.data.gates,
          });
        }
      },
      onError: () => {
        setEventDetails({
          event: event,
          aircraft: [],
          gates: [],
        });
      },
    }
  );

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  useEffect(() => {
    getEventDetails({ eventId: event.id });
  }, [event.id, getEventDetails]);

  const getInitialData = (
    eventData: typeof event,
    eventDetailsData?: {
      event: Event;
      aircraft: EventAircraft[];
      gates: EventGate[];
    } | null
  ) => {
    const sourceEvent = eventDetailsData?.event || eventData;
    const sourceAircraft = eventDetailsData?.aircraft || [];
    const sourceGates = eventDetailsData?.gates || [];

    const departureDateTime = new Date(sourceEvent.departureTime);

    return {
      title: sourceEvent.title,
      description: sourceEvent.description || '',
      imageUrl: sourceEvent.imageUrl || '',
      departureIcao: sourceEvent.departureIcao,
      arrivalIcao: sourceEvent.arrivalIcao,
      departureDate: departureDateTime,
      departureTimeUtc: `${departureDateTime.getHours().toString().padStart(2, '0')}:${departureDateTime.getMinutes().toString().padStart(2, '0')}`,
      flightTime: sourceEvent.flightTime,
      flightTimeHours: Math.floor(sourceEvent.flightTime / 60),
      flightTimeMinutes: sourceEvent.flightTime % 60,
      flightNumber: sourceEvent.flightNumber,
      cargo: sourceEvent.cargo,
      fuel: sourceEvent.fuel,
      multiplierId: sourceEvent.multiplierId || '',
      status: sourceEvent.status as 'draft' | 'published',
      aircraftIds: sourceAircraft.map(
        (aircraftItem) => aircraftItem.aircraftId
      ),
      departureGates: sourceGates
        .filter((gate) => gate.airportType === 'departure')
        .map((gate) => gate.gateNumber),
      arrivalGates: sourceGates
        .filter((gate) => gate.airportType === 'arrival')
        .map((gate) => gate.gateNumber),
    };
  };

  const initialData = getInitialData(event, eventDetails);

  const handleSubmit = (data: EventFormData, imageFile: File | null) => {
    // Create a proper date by combining the local date with the UTC time
    // This ensures the date is correctly set in the user's timezone
    const departureDate = new Date(data.departureDate);
    const [hours, minutes] = data.departureTimeUtc.split(':').map(Number);

    // Set the time on the local date (not UTC)
    departureDate.setHours(hours, minutes, 0, 0);

    execute({
      eventId: event.id,
      ...data,
      departureTime: departureDate,
      status: data.status,
      multiplierId: data.multiplierId ?? undefined,
      imageFile: imageFile || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className={dialogStyles.className}
        style={dialogStyles.style}
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Event</DialogTitle>
          <DialogDescription className="text-foreground">
            Update the event details and configuration.
          </DialogDescription>
        </DialogHeader>
        {isLoadingDetails ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-12 h-12 border-4 border-muted rounded-full animate-spin">
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-foreground font-medium">
                  Loading event details
                </p>
                <p className="text-muted-foreground text-sm">
                  Please wait while we fetch the latest information
                </p>
              </div>
            </div>
          </div>
        ) : (
          <EventForm
            aircraft={aircraft}
            multipliers={multipliers}
            onSubmit={handleSubmit}
            isSubmitting={isPending}
            initialData={initialData}
            submitButtonText="Update Event"
            submittingText="Updating..."
            onCancel={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
