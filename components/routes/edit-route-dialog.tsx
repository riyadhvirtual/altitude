'use client';

import { useRouter } from 'next/navigation';

import { updateRouteAction } from '@/actions/routes/update-route';
import RouteForm from '@/components/routes/route-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AircraftWithLivery {
  id: string;
  name: string;
  livery?: string;
}

interface EditRouteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  route: {
    id: string;
    departureIcao: string;
    arrivalIcao: string;
    flightTime: number;
    details?: string | null;
    flightNumbers: string[];
    aircraftIds: string[];
  };
  aircraft: AircraftWithLivery[];
  /** Callback executed after route saved */
  onSaved?: () => void;
}

export default function EditRouteDialog({
  open,
  onOpenChange,
  route,
  aircraft,
  onSaved,
}: EditRouteDialogProps) {
  const router = useRouter();

  const handleSaved = () => {
    onOpenChange(false);
    // Refresh parent data
    router.refresh();
    onSaved?.();
  };

  const aircraftData = aircraft.map((a) => ({ ...a, livery: a.livery ?? '' }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="border border-border bg-card shadow-lg sm:max-w-[500px] max-h-[90vh] overflow-y-auto"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Route</DialogTitle>
          <DialogDescription className="text-foreground">
            Update route details, aircraft and flight numbers.
          </DialogDescription>
        </DialogHeader>
        <RouteForm
          initialRoute={route}
          aircraft={aircraftData}
          onSaved={handleSaved}
          action={updateRouteAction}
          mode="edit"
          submitText="Save Changes"
          cancelButton={
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          }
        />
      </DialogContent>
    </Dialog>
  );
}
