'use client';

import { Layers, MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useState } from 'react';
import { toast } from 'sonner';

import { deleteAircraftAction } from '@/actions/aircraft/delete-aircraft';
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
import { useResponsiveDialog } from '@/hooks/use-responsive-dialog';
import { extractErrorMessage } from '@/lib/error-handler';

import EditAircraftDialog from './edit-aircraft-dialog';

interface Aircraft {
  id: string;
  name: string;
  livery: string;
  createdAt: string | Date;
  pirepCount?: number;
}

export function AircraftList(props: { [key: string]: unknown }) {
  const aircraft = props.aircraft as Aircraft[];
  const total = props.total as number;
  const limit = (props.limit as number) ?? 10;
  const router = useRouter();
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const { dialogStyles } = useResponsiveDialog({
    maxWidth: 'sm:max-w-[500px]',
  });

  const totalPages = Math.ceil(total / limit);

  const handlePageChange = async (newPage: number) => {
    await setPage(newPage);
    router.refresh();
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [aircraftToDelete, setAircraftToDelete] = useState<Aircraft | null>(
    null
  );

  const { execute: deleteAircraft, isExecuting } = useAction(
    deleteAircraftAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success) {
          toast.success(data.message || 'Aircraft deleted successfully');
          setDeleteDialogOpen(false);
          setAircraftToDelete(null);
        } else {
          toast.error(data?.error || 'Failed to delete aircraft');
        }
      },
      onError: ({ error }) => {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
      },
    }
  );

  const handleDeleteClick = (plane: Aircraft) => {
    setAircraftToDelete(plane);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (aircraftToDelete) {
      deleteAircraft({ id: aircraftToDelete.id });
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setAircraftToDelete(null);
  };

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [aircraftToEdit, setAircraftToEdit] = useState<Aircraft | null>(null);

  const handleEditClick = (plane: Aircraft) => {
    setAircraftToEdit(plane);
    setEditDialogOpen(true);
  };

  return (
    <>
      <div className="overflow-hidden rounded-md border border-border bg-panel shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="bg-muted/50 font-semibold text-foreground">
                Aircraft Name
              </TableHead>
              <TableHead className="bg-muted/50 font-semibold text-foreground">
                Livery
              </TableHead>
              <TableHead className="bg-muted/50 font-semibold text-foreground">
                Date Added
              </TableHead>
              <TableHead className="w-[50px] bg-muted/50" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {aircraft.length === 0 ? (
              <TableRow>
                <TableCell
                  className="px-6 py-12 text-center text-foreground"
                  colSpan={5}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Layers className="h-6 w-6 text-foreground" />
                    <p>No aircraft in fleet</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              aircraft.map((plane) => (
                <TableRow
                  className="transition-colors hover:bg-muted/30"
                  key={plane.id}
                >
                  <TableCell className="font-medium text-foreground">
                    {plane.name}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {plane.livery}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {new Date(plane.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
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
                          onClick={() => handleEditClick(plane)}
                        >
                          Edit Aircraft
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={isExecuting}
                          onClick={() => handleDeleteClick(plane)}
                        >
                          Delete Aircraft
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
            <DialogTitle className="text-foreground">
              Delete Aircraft
            </DialogTitle>
            <DialogDescription className="space-y-2 text-foreground">
              <span>
                Are you sure you want to delete &quot;{aircraftToDelete?.name} -{' '}
                {aircraftToDelete?.livery}
                &quot;? This action cannot be undone.
              </span>
            </DialogDescription>
            {typeof aircraftToDelete?.pirepCount === 'number' &&
              aircraftToDelete.pirepCount > 0 && (
                <div className="mt-4 rounded-md bg-yellow-50 p-3 dark:bg-yellow-900/20">
                  <span className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Warning:</strong> This aircraft is used in{' '}
                    {aircraftToDelete.pirepCount} pirep
                    {aircraftToDelete.pirepCount === 1 ? '' : 's'}. After
                    deletion, these pireps will show &quot;Unknown&quot; as the
                    aircraft.
                  </span>
                </div>
              )}
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

      {aircraftToEdit && (
        <EditAircraftDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          aircraft={aircraftToEdit}
        />
      )}

      {totalPages > 1 && (
        <DataPagination
          page={page}
          totalPages={totalPages}
          totalItems={total}
          itemsPerPage={limit}
          itemLabelPlural="aircraft"
          onPageChange={handlePageChange}
          className="mt-4"
        />
      )}
    </>
  );
}
