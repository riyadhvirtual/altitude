import { Plus } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { LeaveTable } from '@/components/leave/leave-table';
import { Button } from '@/components/ui/button';
import { getLeaveRequestsPaginatedForUser } from '@/db/queries';
import { authCheck } from '@/lib/auth-check';
import { parsePaginationParams } from '@/lib/pagination';

export function generateMetadata(): Metadata {
  return {
    title: 'My Leave Requests',
  };
}

interface LeaveRequestsPageProps {
  searchParams?: Promise<{
    page?: string;
  }>;
}

export default async function LeaveRequestsPage({
  searchParams,
}: LeaveRequestsPageProps) {
  const session = await authCheck();

  const { page, limit } = await parsePaginationParams(searchParams);

  const { leaveRequests, total } = await getLeaveRequestsPaginatedForUser(
    session.user.id,
    page,
    limit
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="space-y-1 w-full md:w-auto">
          <h3 className="font-medium text-2xl md:text-3xl text-foreground break-normal">
            My Leave Requests
          </h3>
          <p className="text-muted-foreground">Manage your leave requests</p>
        </div>
        <div className="flex items-center gap-2 md:ml-auto">
          <Button asChild>
            <Link href="/leave/new">
              <Plus className="h-4 w-4" />
              Request Leave
            </Link>
          </Button>
        </div>
      </div>
      <LeaveTable
        leaveRequests={leaveRequests}
        total={total}
        limit={limit}
        baseUrl="/leave"
      />
    </div>
  );
}
