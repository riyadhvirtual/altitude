'use client';

import { differenceInHours, differenceInMinutes, format } from 'date-fns';
import { useAction } from 'next-safe-action/hooks';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { assignGateAction } from '@/actions/events/assign-gate';
import { removeParticipantAction } from '@/actions/events/remove-participant';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ResponsiveDialogFooter } from '@/components/ui/responsive-dialog-footer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Event, EventGate, EventParticipant } from '@/db/schema';
import { useResponsiveDialog } from '@/hooks/use-responsive-dialog';
import { cn, formatHoursMinutes } from '@/lib/utils';

type ParticipantWithUser = {
  participant: EventParticipant;
  user: { name: string; callsign: number | null; email: string };
};

interface AdminEventDetailsProps {
  event: Event;
  participants: ParticipantWithUser[];
  gates: EventGate[];
}

export function AdminEventDetails({
  event,
  participants,
  gates,
}: AdminEventDetailsProps) {
  const [localParticipants, setLocalParticipants] = useState(participants);
  const lastGateActionRef = useRef<'assign' | 'unassign'>('assign');

  const departureGates = useMemo(
    () => gates.filter((g) => g.airportType === 'departure'),
    [gates]
  );
  const arrivalGates = useMemo(
    () => gates.filter((g) => g.airportType === 'arrival'),
    [gates]
  );

  const totalParticipants = localParticipants.length;
  const totalGates = gates.length;

  const unassignedDepartureParticipants = localParticipants.filter(
    (p) => !p.participant.departureGateId
  );
  const unassignedArrivalParticipants = localParticipants.filter(
    (p) => !p.participant.arrivalGateId
  );

  const assignedDepartureGateIds = new Set(
    localParticipants
      .map((p) => p.participant.departureGateId)
      .filter(Boolean) as string[]
  );
  const assignedArrivalGateIds = new Set(
    localParticipants
      .map((p) => p.participant.arrivalGateId)
      .filter(Boolean) as string[]
  );

  const unassignedDepartureGates = departureGates.filter(
    (g) => !assignedDepartureGateIds.has(g.id)
  );
  const unassignedArrivalGates = arrivalGates.filter(
    (g) => !assignedArrivalGateIds.has(g.id)
  );

  const countdown = useMemo(() => {
    const now = new Date();
    const dt = new Date(event.departureTime);
    const diffMins = differenceInMinutes(dt, now);
    if (diffMins <= 0) {
      return 'Event started';
    }
    if (diffMins < 60) {
      return `Event in ${diffMins} min`;
    }
    const diffHours = differenceInHours(dt, now);
    if (diffHours < 24) {
      return `Event in ${diffHours} h`;
    }
    const days = Math.floor(diffHours / 24);
    return `Event in ${days} days`;
  }, [event.departureTime]);

  const { execute: assignGate, isExecuting: assigning } = useAction(
    assignGateAction,
    {
      onSuccess: ({ data }) => {
        if (data?.participant) {
          const updatedParticipant = data.participant as EventParticipant;
          setLocalParticipants((prev) =>
            prev.map((p) =>
              p.participant.userId === updatedParticipant.userId
                ? { ...p, participant: updatedParticipant }
                : p
            )
          );
        }
        const message =
          lastGateActionRef.current === 'unassign'
            ? 'Gate unassigned'
            : data?.message || 'Gate assigned';
        toast.success(message);
      },
      onError: ({ error }) =>
        toast.error(error.serverError || 'Failed to assign gate'),
    }
  );

  const handleAssign = (
    userId: string,
    gateId: string | null,
    gateType: 'departure' | 'arrival'
  ) => {
    if (!gateId) {
      lastGateActionRef.current = 'unassign';
      // Handle unassigning by setting gateId to null
      assignGate({
        eventId: event.id,
        gateId: '__unassign__',
        gateType,
        userIdOverride: userId,
      } as {
        eventId: string;
        gateId: string;
        gateType: 'departure' | 'arrival';
        userIdOverride: string;
      });
      return;
    }

    lastGateActionRef.current = 'assign';
    assignGate({
      eventId: event.id,
      gateId,
      gateType,
      userIdOverride: userId,
    } as {
      eventId: string;
      gateId: string;
      gateType: 'departure' | 'arrival';
      userIdOverride: string;
    });
  };

  const findGateNumber = (gateId: string | null | undefined) => {
    if (!gateId) {
      return undefined;
    }
    return gates.find((g) => g.id === gateId)?.gateNumber;
  };

  return (
    <div className="space-y-6">
      <SectionCard className="sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="text-lg font-semibold">{event.title}</div>
          <div className="text-sm text-muted-foreground">
            {event.departureIcao} → {event.arrivalIcao} •{' '}
            {format(new Date(event.departureTime), 'MMM d, yyyy HH:mm')} •{' '}
            {formatHoursMinutes(event.flightTime)}
          </div>
        </div>
        <div className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
          {countdown}
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Participants" value={totalParticipants} />
        <StatTile label="Total Gates" value={totalGates} />
        <StatTile
          label="Unassigned Participants"
          value={
            new Set(
              [
                ...unassignedDepartureParticipants,
                ...unassignedArrivalParticipants,
              ].map((p) => p.participant.userId)
            ).size
          }
        />
        <StatTile
          label="Unassigned Gates"
          value={
            unassignedDepartureGates.length + unassignedArrivalGates.length
          }
        />
      </div>

      <Tabs defaultValue="participants" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="gates">Gates</TabsTrigger>
        </TabsList>

        <TabsContent value="participants" className="mt-0">
          <div className="overflow-hidden rounded-md border border-border bg-panel shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="bg-muted/50 font-semibold text-foreground">
                    Name
                  </TableHead>
                  <TableHead className="bg-muted/50 font-semibold text-foreground">
                    Email
                  </TableHead>
                  <TableHead className="bg-muted/50 text-center font-semibold text-foreground">
                    Dep Gate
                  </TableHead>
                  <TableHead className="bg-muted/50 text-center font-semibold text-foreground">
                    Arr Gate
                  </TableHead>
                  <TableHead className="w-[50px] bg-muted/50" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {localParticipants.length === 0 && (
                  <TableRow>
                    <TableCell
                      className="px-6 py-12 text-center text-foreground"
                      colSpan={5}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <p>No participants yet</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {localParticipants.length > 0 &&
                  localParticipants.map(({ participant, user }) => {
                    const departureGateNumber = findGateNumber(
                      participant.departureGateId
                    );
                    const arrivalGateNumber = findGateNumber(
                      participant.arrivalGateId
                    );
                    const availableDeparture = [
                      departureGateNumber,
                      ...unassignedDepartureGates
                        .map((g) => g.gateNumber)
                        .filter(Boolean),
                    ];
                    const availableArrival = [
                      arrivalGateNumber,
                      ...unassignedArrivalGates
                        .map((g) => g.gateNumber)
                        .filter(Boolean),
                    ];
                    return (
                      <TableRow
                        key={participant.id}
                        className="transition-colors hover:bg-muted/30"
                      >
                        <TableCell className="font-medium text-foreground">
                          {user?.name || `User ${participant.userId}`}
                        </TableCell>
                        <TableCell className="text-sm text-foreground">
                          {user?.email ?? ''}
                        </TableCell>
                        <TableCell className="text-center">
                          <Select
                            value={departureGateNumber || '__unassigned__'}
                            onValueChange={(gateNumber) => {
                              if (gateNumber === '__unassigned__') {
                                handleAssign(
                                  participant.userId,
                                  null,
                                  'departure'
                                );
                                return;
                              }
                              const gate = departureGates.find(
                                (g) => g.gateNumber === gateNumber
                              );
                              if (!gate) {
                                return;
                              }
                              handleAssign(
                                participant.userId,
                                gate.id,
                                'departure'
                              );
                            }}
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue placeholder="Unassigned" />
                            </SelectTrigger>
                            <SelectContent
                              align="start"
                              side="bottom"
                              position="popper"
                            >
                              <SelectItem value="__unassigned__">
                                Unassigned
                              </SelectItem>
                              {availableDeparture.filter(Boolean).map((g) => (
                                <SelectItem key={g} value={g as string}>
                                  {g}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-center">
                          <Select
                            value={arrivalGateNumber || '__unassigned__'}
                            onValueChange={(gateNumber) => {
                              if (gateNumber === '__unassigned__') {
                                handleAssign(
                                  participant.userId,
                                  null,
                                  'arrival'
                                );
                                return;
                              }
                              const gate = arrivalGates.find(
                                (g) => g.gateNumber === gateNumber
                              );
                              if (!gate) {
                                return;
                              }
                              handleAssign(
                                participant.userId,
                                gate.id,
                                'arrival'
                              );
                            }}
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue placeholder="Unassigned" />
                            </SelectTrigger>
                            <SelectContent
                              align="start"
                              side="bottom"
                              position="popper"
                            >
                              <SelectItem value="__unassigned__">
                                Unassigned
                              </SelectItem>
                              {availableArrival.filter(Boolean).map((g) => (
                                <SelectItem key={g} value={g as string}>
                                  {g}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <RemoveParticipantButton
                            userId={participant.userId}
                            eventId={event.id}
                            userName={
                              user?.name || `User ${participant.userId}`
                            }
                            onRemoved={() => {
                              setLocalParticipants((prev) =>
                                prev.filter(
                                  (p) =>
                                    p.participant.userId !== participant.userId
                                )
                              );
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="gates" className="mt-0">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="overflow-hidden rounded-md border border-border bg-panel shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="bg-muted/50 font-semibold text-foreground">
                      Gate ({event.departureIcao})
                    </TableHead>
                    <TableHead className="w-[50px] bg-muted/50" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departureGates.length === 0 && (
                    <TableRow>
                      <TableCell
                        className="px-6 py-12 text-center text-foreground"
                        colSpan={2}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <p>No departure gates</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {departureGates.length > 0 &&
                    departureGates.map((gate) => {
                      const assigned = localParticipants.find(
                        (p) => p.participant.departureGateId === gate.id
                      );
                      const unassignedUsers = localParticipants.filter(
                        (p) => !p.participant.departureGateId
                      );
                      return (
                        <TableRow
                          key={gate.id}
                          className="transition-colors hover:bg-muted/30"
                        >
                          <TableCell className="font-medium text-foreground">
                            {gate.gateNumber}
                          </TableCell>
                          <TableCell className="text-right">
                            <Select
                              value=""
                              onValueChange={(val) => {
                                if (val === '__unassign__' && assigned) {
                                  handleAssign(
                                    assigned.participant.userId,
                                    null,
                                    'departure'
                                  );
                                  return;
                                }
                                const user = unassignedUsers.find(
                                  (u) => u.participant.userId === val
                                );
                                if (!user) {
                                  return;
                                }
                                handleAssign(
                                  user.participant.userId,
                                  gate.id,
                                  'departure'
                                );
                              }}
                              disabled={assigning}
                            >
                              <SelectTrigger className="w-44">
                                <SelectValue
                                  placeholder={
                                    assigned
                                      ? assigned.user?.name ||
                                        `User ${assigned.participant.userId}`
                                      : 'Assign'
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent
                                align="start"
                                side="bottom"
                                position="popper"
                              >
                                {assigned ? (
                                  <SelectItem value="__unassign__">
                                    Unassign
                                  </SelectItem>
                                ) : null}
                                {unassignedUsers.map((p) => (
                                  <SelectItem
                                    key={p.participant.id}
                                    value={p.participant.userId}
                                  >
                                    {p.user?.name ||
                                      `User ${p.participant.userId}`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>

            <div className="overflow-hidden rounded-md border border-border bg-panel shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="bg-muted/50 font-semibold text-foreground">
                      Gate ({event.arrivalIcao})
                    </TableHead>
                    <TableHead className="w-[50px] bg-muted/50" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {arrivalGates.length === 0 && (
                    <TableRow>
                      <TableCell
                        className="px-6 py-12 text-center text-foreground"
                        colSpan={2}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <p>No arrival gates</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {arrivalGates.length > 0 &&
                    arrivalGates.map((gate) => {
                      const assigned = localParticipants.find(
                        (p) => p.participant.arrivalGateId === gate.id
                      );
                      const unassignedUsers = localParticipants.filter(
                        (p) => !p.participant.arrivalGateId
                      );
                      return (
                        <TableRow
                          key={gate.id}
                          className="transition-colors hover:bg-muted/30"
                        >
                          <TableCell className="font-medium text-foreground">
                            {gate.gateNumber}
                          </TableCell>
                          <TableCell className="text-right">
                            <Select
                              value=""
                              onValueChange={(val) => {
                                if (val === '__unassign__' && assigned) {
                                  handleAssign(
                                    assigned.participant.userId,
                                    null,
                                    'arrival'
                                  );
                                  return;
                                }
                                const user = unassignedUsers.find(
                                  (u) => u.participant.userId === val
                                );
                                if (!user) {
                                  return;
                                }
                                handleAssign(
                                  user.participant.userId,
                                  gate.id,
                                  'arrival'
                                );
                              }}
                              disabled={assigning}
                            >
                              <SelectTrigger className="w-44">
                                <SelectValue
                                  placeholder={
                                    assigned
                                      ? assigned.user?.name ||
                                        `User ${assigned.participant.userId}`
                                      : 'Assign'
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent
                                align="start"
                                side="bottom"
                                position="popper"
                              >
                                {assigned ? (
                                  <SelectItem value="__unassign__">
                                    Unassign
                                  </SelectItem>
                                ) : null}
                                {unassignedUsers.map((p) => (
                                  <SelectItem
                                    key={p.participant.id}
                                    value={p.participant.userId}
                                  >
                                    {p.user?.name ||
                                      `User ${p.participant.userId}`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RemoveParticipantButton({
  userId,
  eventId,
  onRemoved,
  userName,
}: {
  userId: string;
  eventId: string;
  onRemoved: () => void;
  userName?: string;
}) {
  const [open, setOpen] = useState(false);
  const { dialogStyles } = useResponsiveDialog({
    maxWidth: 'sm:max-w-[420px]',
  });

  const { execute, isExecuting } = useAction(removeParticipantAction, {
    onSuccess: ({ data }) => {
      toast.success(data?.message || 'Participant removed');
      onRemoved();
      setOpen(false);
    },
    onError: ({ error }) =>
      toast.error(error.serverError || 'Failed to remove'),
  });

  const handleConfirm = () => {
    execute({ eventId, targetUserId: userId });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive" disabled={isExecuting}>
          Remove from event
        </Button>
      </DialogTrigger>
      <DialogContent
        className={`${dialogStyles.className} max-w-[380px]`}
        style={dialogStyles.style}
        showCloseButton
        transitionFrom="bottom-left"
      >
        <DialogHeader>
          <DialogTitle>Remove Participant</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove{' '}
            <strong>{userName ?? 'this user'}</strong> from this event? Any gate
            assignments will be cleared. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-200">
            <strong>Warning:</strong> Removing a participant will revoke their
            access to this event and unassign their gates.
          </p>
        </div>

        <ResponsiveDialogFooter
          primaryButton={{
            label: 'Remove',
            onClick: handleConfirm,
            disabled: isExecuting,
            loading: isExecuting,
            loadingLabel: 'Removing...',
            className:
              'bg-destructive text-destructive-foreground hover:bg-destructive/90',
          }}
          secondaryButton={{
            label: 'Cancel',
            onClick: () => setOpen(false),
            disabled: isExecuting,
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function SectionCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-md border border-input bg-panel p-4',
        className
      )}
    >
      {children}
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-input bg-panel p-4">
      <div className="text-xs uppercase text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
