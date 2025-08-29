'use client';

import { Map, MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useState } from 'react';
import { toast } from 'sonner';

import { deleteRouteAction } from '@/actions/routes/delete-route';
import { Button } from '@/components/ui/button';
import { DataPagination } from '@/components/ui/data-pagination';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatHoursMinutes } from '@/lib/utils';

interface RouteItem {
  id: string;
  departureIcao: string;
  arrivalIcao: string;
  flightTime: number;
  details?: string | null;
  createdAt: string | Date;
  flightNumbers?: string[];
}

interface RoutesTableProps {
  routes: RouteItem[];
  total: number;
  limit?: number;
  onEdit?: (id: string) => void;
}

export function RoutesTable({
  routes,
  total,
  limit = 10,
  onEdit,
}: RoutesTableProps) {
  const router = useRouter();
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState<RouteItem | null>(null);

  const { execute: deleteRoute, isExecuting } = useAction(deleteRouteAction, {
    onSuccess: ({ data }) => {
      toast.success(data?.message || 'Route deleted');
      setDeleteDialogOpen(false);
      setRouteToDelete(null);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to delete route');
    },
  });

  const handleDeleteClick = (route: RouteItem) => {
    setRouteToDelete(route);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (routeToDelete) {
      deleteRoute({ id: routeToDelete.id });
    }
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
                Flight Numbers
              </TableHead>
              <TableHead className="bg-muted/50 font-semibold text-foreground">
                Departure
              </TableHead>
              <TableHead className="bg-muted/50 font-semibold text-foreground">
                Arrival
              </TableHead>
              <TableHead className="bg-muted/50 font-semibold text-foreground">
                Flight Time
              </TableHead>
              <TableHead className="w-[50px] bg-muted/50" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {routes.length === 0 ? (
              <TableRow>
                <TableCell
                  className="px-6 py-12 text-center text-foreground"
                  colSpan={6}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Map className="h-8 w-8 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      No routes created yet
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Create your first route to get started
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              routes.map((route) => (
                <TableRow
                  key={route.id}
                  className="transition-colors hover:bg-muted/30"
                >
                  <TableCell className="text-foreground">
                    <div className="flex flex-wrap gap-1">
                      {(() => {
                        const nums = route.flightNumbers || [];
                        const visible = nums.slice(0, 3);
                        return (
                          <>
                            {visible.map((n) => (
                              <span
                                key={n}
                                className="rounded bg-muted px-2 py-0.5 text-xs text-foreground"
                              >
                                {n}
                              </span>
                            ))}
                            {nums.length > 3 && (
                              <span className="rounded bg-muted px-2 py-0.5 text-xs text-foreground">
                                +{nums.length - 3}
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-foreground uppercase">
                    {route.departureIcao}
                  </TableCell>
                  <TableCell className="font-medium text-foreground uppercase">
                    {route.arrivalIcao}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {formatHoursMinutes(route.flightTime)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="h-8 w-8 p-0" variant="ghost">
                          <MoreHorizontal className="h-4 w-4 text-foreground" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            onEdit
                              ? onEdit(route.id)
                              : router.push(`/admin/routes/${route.id}`)
                          }
                        >
                          Edit Route
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={isExecuting}
                          onClick={() => handleDeleteClick(route)}
                        >
                          Delete Route
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent
          className="border border-border bg-card shadow-lg sm:max-w-[425px]"
          showCloseButton
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">Delete Route</DialogTitle>
            <DialogDescription className="text-foreground">
              Are you sure you want to delete this route?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="text-foreground"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isExecuting}
            >
              {isExecuting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {totalPages > 1 && (
        <div className="mt-4 flex justify-end">
          <DataPagination
            page={page}
            totalPages={totalPages}
            totalItems={total}
            itemsPerPage={limit}
            itemLabelPlural="routes"
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </>
  );
}
