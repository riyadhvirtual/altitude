'use client';

import { format } from 'date-fns';
import { Calendar, MoreHorizontal, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useState } from 'react';
import { toast } from 'sonner';

import { deleteEventAction } from '@/actions/events/delete-event';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataPagination } from '@/components/ui/data-pagination';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ResponsiveDialogFooter } from '@/components/ui/responsive-dialog-footer';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { type Aircraft, type Event, type Multiplier } from '@/db/schema';
import { useResponsiveDialog } from '@/hooks/use-responsive-dialog';
import { formatHoursMinutes } from '@/lib/utils';

import EditEventDialog from './edit-event-dialog';

interface EventsTableProps {
  events: (Event & { participantsCount: number })[];
  total: number;
  limit?: number;
  aircraft: Aircraft[];
  multipliers: Multiplier[];
}

export function EventsTable({
  events,
  total,
  limit = 10,
  aircraft,
  multipliers,
}: EventsTableProps) {
  const router = useRouter();
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [_editDialogOpen, setEditDialogOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  const { dialogStyles } = useResponsiveDialog({
    maxWidth: 'sm:max-w-[425px]',
  });

  const { execute: deleteEvent, isExecuting } = useAction(deleteEventAction, {
    onSuccess: ({ data }) => {
      toast.success(data?.message || 'Event deleted successfully');
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to delete event');
    },
  });

  const handleDeleteClick = (event: Event) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (eventToDelete) {
      deleteEvent({ eventId: eventToDelete.id });
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setEventToDelete(null);
  };

  const handleEditClick = (event: Event) => {
    setEventToEdit(event);
    setEditDialogOpen(true);
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), 'MMM dd, yyyy HH:mm');
  };

  const totalPages = Math.ceil(total / limit);

  const handlePageChange = async (newPage: number) => {
    await setPage(newPage);
    router.refresh();
  };

  // Ensure status ordering: Draft -> Published -> Finished (others after)
  const isFinished = (event: Event) => {
    const now = Date.now();
    const dep = new Date(event.departureTime).getTime();
    const end = dep + (event.flightTime ?? 0) * 60 * 1000;
    const finishedExplicit =
      event.status === 'completed' || event.status === 'cancelled';
    const finishedDerived = Number.isFinite(end) ? now > end : now > dep;
    return finishedExplicit || finishedDerived;
  };

  const statusPriority = (event: Event) => {
    if (event.status === 'draft') {
      return 0;
    }
    if (event.status === 'published' && !isFinished(event)) {
      return 1;
    }
    if (isFinished(event)) {
      return 2;
    }
    // Any other statuses go after the main three groups, shouldn't happen though
    return 3;
  };

  const sortedEvents = [...events].sort(
    (a, b) => statusPriority(a) - statusPriority(b)
  );

  return (
    <>
      <div className="overflow-hidden rounded-md border border-border bg-panel shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="bg-muted/50 font-semibold text-foreground">
                Event
              </TableHead>
              <TableHead className="bg-muted/50 font-semibold text-foreground">
                Route
              </TableHead>
              <TableHead className="bg-muted/50 font-semibold text-foreground">
                Flight Time
              </TableHead>
              <TableHead className="bg-muted/50 font-semibold text-foreground">
                Departure Time
              </TableHead>
              <TableHead className="bg-muted/50 font-semibold text-foreground">
                Status
              </TableHead>
              <TableHead className="bg-muted/50 font-semibold text-foreground">
                Participants
              </TableHead>
              <TableHead className="w-[50px] bg-muted/50" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell
                  className="px-6 py-12 text-center text-foreground"
                  colSpan={7}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Calendar className="h-6 w-6 text-foreground" />
                    <p>No events found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedEvents.map((event) => (
                <TableRow
                  className="transition-colors hover:bg-muted/30"
                  key={event.id}
                >
                  <TableCell className="font-medium text-foreground">
                    <div className="font-medium">
                      <Link
                        href={`/admin/events/${event.id}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {event.title}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">
                        {event.departureIcao}
                      </span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-mono text-sm">
                        {event.arrivalIcao}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">
                    <span className="text-sm">
                      {formatHoursMinutes(event.flightTime)}
                    </span>
                  </TableCell>
                  <TableCell className="text-foreground">
                    <span className="text-sm">
                      {formatDate(event.departureTime)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const now = Date.now();
                      const dep = new Date(event.departureTime).getTime();
                      const end = dep + (event.flightTime ?? 0) * 60 * 1000;
                      const finishedExplicit =
                        event.status === 'completed' ||
                        event.status === 'cancelled';
                      const finishedDerived = Number.isFinite(end)
                        ? now > end
                        : now > dep;

                      if (event.status === 'draft') {
                        return <Badge variant="pending">Draft</Badge>;
                      }
                      if (finishedExplicit || finishedDerived) {
                        return <Badge variant="finished">Finished</Badge>;
                      }
                      if (event.status === 'published') {
                        return <Badge variant="approved">Published</Badge>;
                      }
                      return (
                        <Badge variant="outline">
                          {event.status.charAt(0).toUpperCase() +
                            event.status.slice(1)}
                        </Badge>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="text-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{event.participantsCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          className="h-8 w-8 p-0 text-foreground"
                          disabled={isExecuting}
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          disabled={isExecuting}
                          onClick={() =>
                            router.push(`/admin/events/${event.id}`)
                          }
                        >
                          View Details
                        </DropdownMenuItem>
                        {!isFinished(event) && (
                          <DropdownMenuItem
                            disabled={isExecuting}
                            onClick={() => handleEditClick(event)}
                          >
                            Edit Event
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          disabled={isExecuting}
                          onClick={() => handleDeleteClick(event)}
                        >
                          Delete Event
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog onOpenChange={setDeleteDialogOpen} open={deleteDialogOpen}>
        <DialogContent
          className={dialogStyles.className}
          style={dialogStyles.style}
          showCloseButton
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">Delete Event</DialogTitle>
            <DialogDescription className="text-foreground">
              Are you sure you want to delete &quot;{eventToDelete?.title}
              &quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <ResponsiveDialogFooter
            primaryButton={{
              label: isExecuting ? 'Deleting...' : 'Delete',
              onClick: handleConfirmDelete,
              disabled: isExecuting,
              loading: isExecuting,
              loadingLabel: 'Deleting...',
              className:
                'bg-destructive text-destructive-foreground hover:bg-destructive/90',
            }}
            secondaryButton={{
              label: 'Cancel',
              onClick: handleCancelDelete,
              disabled: isExecuting,
            }}
          />
        </DialogContent>
      </Dialog>

      {eventToEdit && (
        <EditEventDialog
          event={eventToEdit}
          aircraft={aircraft}
          multipliers={multipliers}
          onClose={() => {
            setEventToEdit(null);
            setEditDialogOpen(false);
          }}
        />
      )}

      {totalPages > 1 && (
        <DataPagination
          page={page}
          totalPages={totalPages}
          totalItems={total}
          itemsPerPage={limit}
          itemLabelPlural="events"
          onPageChange={handlePageChange}
          className="mt-4"
        />
      )}
    </>
  );
}
