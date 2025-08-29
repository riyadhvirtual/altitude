'use client';

import { Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { parseAsInteger, useQueryState } from 'nuqs';

import { Button } from '@/components/ui/button';
import { DataPagination } from '@/components/ui/data-pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserAvatar } from '@/components/ui/user-avatar';
import { LeaveRequest, User } from '@/db/schema';
import { Airline } from '@/db/schema';
import { formatFullCallsign } from '@/lib/utils';

interface LeaveTableProps {
  leaveRequests: (LeaveRequest & { user?: Partial<User> | null })[];
  total: number;
  limit?: number;
  showPilotName?: boolean;
  airline?: Airline;
  baseUrl?: string;
  canViewUsers?: boolean;
}

function formatDateRange(startDate: Date, endDate: Date) {
  const start = new Date(startDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const end = new Date(endDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  return `${start} - ${end}`;
}

function calculateDuration(startDate: Date, endDate: Date) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function LeaveTable({
  leaveRequests,
  total,
  limit = 10,
  showPilotName = false,
  airline,
  baseUrl = '/leave',
  canViewUsers = false,
}: LeaveTableProps) {
  const router = useRouter();
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
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
              {showPilotName && (
                <TableHead className="bg-muted/50 font-semibold text-foreground">
                  Pilot
                </TableHead>
              )}
              <TableHead className="bg-muted/50 font-semibold text-foreground">
                Date Range
              </TableHead>
              <TableHead className="bg-muted/50 font-semibold text-foreground">
                Duration
              </TableHead>
              <TableHead className="bg-muted/50 font-semibold text-foreground">
                Status
              </TableHead>
              <TableHead className="w-[50px] bg-muted/50" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaveRequests.length === 0 ? (
              <TableRow>
                <TableCell
                  className="px-6 py-12 text-center text-foreground"
                  colSpan={showPilotName ? 7 : 6}
                >
                  <div className="flex flex-col items-center gap-2">
                    <CalendarIcon className="h-6 w-6 text-muted-foreground" />
                    <p>No leave requests found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              leaveRequests.map((request) => (
                <TableRow
                  key={request.id}
                  className="transition-colors hover:bg-muted/30"
                >
                  {showPilotName && (
                    <TableCell className="font-medium text-foreground">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          user={{
                            id: (request.user?.id as string) ?? '',
                            name: request.user?.name ?? 'Unknown',
                            email: (request.user?.email as string) ?? '',
                            image:
                              (request.user?.image as string | null) ?? null,
                          }}
                          className="h-8 w-8 flex-shrink-0"
                        />
                        {canViewUsers && request.user?.id ? (
                          <Link
                            href={`/admin/users/${request.userId}`}
                            className="text-foreground hover:underline focus:underline outline-none"
                          >
                            {request.user?.name || 'Unknown'}
                          </Link>
                        ) : (
                          <span>{request.user?.name || 'Unknown'}</span>
                        )}
                        {airline && request.user?.callsign && (
                          <span className="rounded bg-muted px-2 py-0.5 text-xs text-foreground">
                            {formatFullCallsign(
                              airline.callsign,
                              request.user.callsign.toString()
                            )}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  )}
                  <TableCell className="text-foreground">
                    {formatDateRange(request.startDate, request.endDate)}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {calculateDuration(request.startDate, request.endDate)} days
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={request.status} />
                  </TableCell>
                  <TableCell>
                    <Button size="sm" asChild>
                      <Link href={`${baseUrl}/${request.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <DataPagination
          page={page}
          totalPages={totalPages}
          totalItems={total}
          itemsPerPage={limit}
          itemLabelPlural="leave requests"
          onPageChange={handlePageChange}
          className="mt-4"
        />
      )}
    </>
  );
}
