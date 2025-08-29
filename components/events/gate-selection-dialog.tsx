'use client';

import { Check } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ResponsiveDialogFooter } from '@/components/ui/responsive-dialog-footer';
import type { EventGate } from '@/db/schema';
import { useResponsiveDialog } from '@/hooks/use-responsive-dialog';

interface GateSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventGates: EventGate[];
  onJoin: (departureGateId?: string, arrivalGateId?: string) => void;
  isLoading?: boolean;
}

export function GateSelectionDialog({
  open,
  onOpenChange,
  eventGates,
  onJoin,
  isLoading = false,
}: GateSelectionDialogProps) {
  const [selectedDepartureGateId, setSelectedDepartureGateId] =
    useState<string>('');
  const [selectedArrivalGateId, setSelectedArrivalGateId] =
    useState<string>('');

  const departureGates = eventGates.filter(
    (gate) => gate.airportType === 'departure'
  );
  const arrivalGates = eventGates.filter(
    (gate) => gate.airportType === 'arrival'
  );

  const { dialogStyles } = useResponsiveDialog({
    maxWidth: 'sm:max-w-[500px]',
  });

  const handleJoin = () => {
    onJoin(
      selectedDepartureGateId || undefined,
      selectedArrivalGateId || undefined
    );
  };

  const handleAutoAssign = () => {
    onJoin();
  };

  const handleGateClick = (
    gateId: string,
    gateType: 'departure' | 'arrival'
  ) => {
    if (gateType === 'departure') {
      if (selectedDepartureGateId === gateId) {
        setSelectedDepartureGateId('');
      } else {
        setSelectedDepartureGateId(gateId);
      }
    } else {
      if (selectedArrivalGateId === gateId) {
        setSelectedArrivalGateId('');
      } else {
        setSelectedArrivalGateId(gateId);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={dialogStyles.className}
        style={dialogStyles.style}
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Choose Your Gates
          </DialogTitle>
          <DialogDescription className="text-foreground">
            Select departure and arrival gates for this event, or let us assign
            them automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-md border border-border bg-muted p-3">
              <Label className="text-xs font-medium text-muted-foreground mb-3 block">
                Departure Gates
              </Label>
              {departureGates.length === 0 ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  No departure gates assigned.
                </p>
              ) : (
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  {departureGates.map((gate) => {
                    const isSelected = selectedDepartureGateId === gate.id;

                    return (
                      <button
                        key={gate.id}
                        type="button"
                        onClick={() => handleGateClick(gate.id, 'departure')}
                        className={`rounded-md border px-2 py-1 text-center transition-colors ${
                          isSelected
                            ? 'border-primary bg-primary/20 text-primary'
                            : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-card/80 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-center">
                          <span>{gate.gateNumber}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-md border border-border bg-muted p-3">
              <Label className="text-xs font-medium text-muted-foreground mb-3 block">
                Arrival Gates
              </Label>
              {arrivalGates.length === 0 ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  No arrival gates assigned.
                </p>
              ) : (
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  {arrivalGates.map((gate) => {
                    const isSelected = selectedArrivalGateId === gate.id;

                    return (
                      <button
                        key={gate.id}
                        type="button"
                        onClick={() => handleGateClick(gate.id, 'arrival')}
                        className={`rounded-md border px-2 py-1 text-center transition-colors ${
                          isSelected
                            ? 'border-primary bg-primary/20 text-primary'
                            : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-card/80 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-center">
                          <span>{gate.gateNumber}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {departureGates.length === 0 && arrivalGates.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              No gates configured for this event.
            </div>
          )}

          <div className="space-y-3">
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleAutoAssign}
                disabled={isLoading}
                className="justify-start"
              >
                <Check className="mr-2 h-4 w-4" />
                Auto-assign available gates
              </Button>
            </div>
          </div>
        </div>

        <ResponsiveDialogFooter
          primaryButton={{
            label: 'Join Event',
            disabled: isLoading,
            loading: isLoading,
            loadingLabel: 'Joining...',
            onClick: handleJoin,
          }}
          secondaryButton={{
            label: 'Cancel',
            onClick: () => onOpenChange(false),
            disabled: isLoading,
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
