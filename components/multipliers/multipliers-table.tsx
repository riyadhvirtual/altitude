'use client';

import { MoreHorizontal, Tags } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useState } from 'react';
import { toast } from 'sonner';

import { deleteMultiplierAction } from '@/actions/multipliers/delete-multiplier';
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

import EditMultiplierDialog from './edit-multiplier-dialog';

interface Multiplier {
  id: string;
  name: string;
  value: number;
  createdAt: string | Date;
  pirepCount?: number;
}

interface MultipliersTableProps {
  multipliers: Multiplier[];
  total: number;
  limit?: number;
  onEdit?: (id: string) => void;
}

export function MultipliersTable({
  multipliers,
  total,
  limit = 10,
}: MultipliersTableProps) {
  const router = useRouter();
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const { dialogStyles } = useResponsiveDialog({
    maxWidth: 'sm:max-w-[500px]',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [multiplierToDelete, setMultiplierToDelete] =
    useState<Multiplier | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [multiplierToEdit, setMultiplierToEdit] = useState<Multiplier | null>(
    null
  );

  const { execute: deleteMultiplier, isExecuting } = useAction(
    deleteMultiplierAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success) {
          toast.success(data.message || 'Multiplier deleted successfully');
          setDeleteDialogOpen(false);
          setMultiplierToDelete(null);
        } else {
          toast.error(data?.error || 'Failed to delete multiplier');
        }
      },
      onError: ({ error }) => {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
      },
    }
  );

  const handleDeleteClick = (multiplier: Multiplier) => {
    setMultiplierToDelete(multiplier);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (multiplierToDelete) {
      deleteMultiplier({ id: multiplierToDelete.id });
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setMultiplierToDelete(null);
  };

  const handleEditClick = (multiplier: Multiplier) => {
    setMultiplierToEdit(multiplier);
    setEditDialogOpen(true);
  };

  const totalPages = Math.ceil(total / limit);

  const handlePageChange = async (newPage: number) => {
    await setPage(newPage);
    router.refresh();
  };

  return (
    <>
      <div className="overflow-hidden rounded-md border border-border bg-panel shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="bg-muted/50 font-semibold text-foreground">
                Multiplier Name
              </TableHead>
              <TableHead className="bg-muted/50 font-semibold text-foreground">
                Value
              </TableHead>
              <TableHead className="bg-muted/50 font-semibold text-foreground">
                Date Added
              </TableHead>
              <TableHead className="w-[50px] bg-muted/50" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {multipliers.length === 0 ? (
              <TableRow>
                <TableCell
                  className="px-6 py-12 text-center text-foreground"
                  colSpan={5}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Tags className="h-6 w-6 text-foreground" />
                    <p>No multipliers found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              multipliers.map((multiplier) => (
                <TableRow
                  className="transition-colors hover:bg-muted/30"
                  key={multiplier.id}
                >
                  <TableCell className="font-medium text-foreground">
                    {multiplier.name}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {multiplier.value}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {new Date(multiplier.createdAt).toLocaleDateString(
                      'en-US',
                      {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      }
                    )}
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
                          onClick={() => handleEditClick(multiplier)}
                        >
                          Edit Multiplier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={isExecuting}
                          onClick={() => handleDeleteClick(multiplier)}
                        >
                          Delete Multiplier
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
              Delete Multiplier
            </DialogTitle>
            <DialogDescription className="text-foreground">
              Are you sure you want to delete &quot;{multiplierToDelete?.name}
              &quot;? This action cannot be undone.
            </DialogDescription>
            {typeof multiplierToDelete?.pirepCount === 'number' &&
              multiplierToDelete.pirepCount > 0 && (
                <div className="mt-4 rounded-md bg-yellow-50 p-3 dark:bg-yellow-900/20">
                  <span className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Warning:</strong> This multiplier is used in{' '}
                    {multiplierToDelete.pirepCount} pirep
                    {multiplierToDelete.pirepCount === 1 ? '' : 's'}. After
                    deletion, these pireps will show &quot;Unknown&quot; as the
                    multiplier.
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

      {multiplierToEdit && (
        <EditMultiplierDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          multiplier={multiplierToEdit}
        />
      )}

      {totalPages > 1 && (
        <DataPagination
          page={page}
          totalPages={totalPages}
          totalItems={total}
          itemsPerPage={limit}
          itemLabelPlural="multipliers"
          onPageChange={handlePageChange}
          className="mt-4"
        />
      )}
    </>
  );
}
