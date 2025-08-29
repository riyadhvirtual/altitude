import { useAction } from 'next-safe-action/hooks';
import { toast } from 'sonner';

import { editRankAction } from '@/actions/ranks/edit-rank';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useResponsiveDialog } from '@/hooks/use-responsive-dialog';
import {
  ActionErrorResponse,
  extractActionErrorMessage,
} from '@/lib/error-handler';

import { RankForm } from './create-rank-dialog';

interface EditRankDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rank: {
    id: string;
    name: string;
    minimumFlightTime: number;
    maximumFlightTime: number | null;
    allowAllAircraft: boolean;
    aircraftIds: string[];
  };
  aircraft: { id: string; name: string; livery: string }[];
}

export default function EditRankDialog({
  open,
  onOpenChange,
  rank,
  aircraft,
}: EditRankDialogProps) {
  const { dialogStyles } = useResponsiveDialog({
    maxWidth: 'sm:max-w-[500px]',
  });
  const { execute, isPending } = useAction(editRankAction, {
    onSuccess: (args) => {
      const { data } = args;
      if (data?.success) {
        toast.success(data.message);
        onOpenChange(false);
      }
    },
    onError: (errorResponse) => {
      const errorMessage = extractActionErrorMessage(
        errorResponse as ActionErrorResponse,
        'Failed to update rank'
      );
      toast.error(errorMessage);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={dialogStyles.className}
        style={dialogStyles.style}
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Rank</DialogTitle>
          <DialogDescription className="text-foreground">
            Update rank details and aircraft permissions.
          </DialogDescription>
        </DialogHeader>
        <RankForm
          initialValues={{
            name: rank.name,
            minimumFlightTime: String(rank.minimumFlightTime),
            maximumFlightTime:
              rank.maximumFlightTime !== null
                ? String(rank.maximumFlightTime)
                : '',
            allowAllAircraft: rank.allowAllAircraft,
            selectedAircraftIds: rank.aircraftIds,
          }}
          onSubmit={({
            name,
            minimumFlightTime,
            maximumFlightTime,
            allowAllAircraft,
            selectedAircraftIds,
          }: {
            name: string;
            minimumFlightTime: string;
            maximumFlightTime: string;
            allowAllAircraft: boolean;
            selectedAircraftIds: string[];
          }) => {
            const minFlightTime = Number(minimumFlightTime);
            const maxFlightTime = maximumFlightTime.trim()
              ? Number(maximumFlightTime)
              : null;
            execute({
              id: rank.id,
              name: name.trim(),
              minimumFlightTime: minFlightTime,
              maximumFlightTime: maxFlightTime,
              allowAllAircraft,
              aircraftIds: selectedAircraftIds,
            });
          }}
          onCancel={() => onOpenChange(false)}
          isPending={isPending}
          aircraft={aircraft}
        />
      </DialogContent>
    </Dialog>
  );
}
