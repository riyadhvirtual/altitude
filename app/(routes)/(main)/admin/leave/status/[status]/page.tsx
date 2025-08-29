import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { LeaveStatusTabs } from '@/components/leave/leave-status-tabs';
import { LeaveTable } from '@/components/leave/leave-table';
import { PageLayout } from '@/components/page-layout';
import { getAirline } from '@/db/queries';
import {
  getLeaveRequestsPaginatedByCategory,
  type LeaveCategory,
} from '@/db/queries/leave';
import { getCurrentUserRoles, requireRole } from '@/lib/auth-check';
import { parsePaginationParams } from '@/lib/pagination';
import { hasRequiredRole } from '@/lib/roles';

interface PageProps {
  params: Promise<{
    status: string;
  }>;
  searchParams?: Promise<{
    page?: string;
    q?: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { status } = await params;
  const title =
    status === 'pending'
      ? 'Pending Leave Requests'
      : status === 'active'
        ? 'Active Leave'
        : status === 'archive'
          ? 'Leave Archive'
          : 'Leave Requests';
  return { title };
}

export default async function LeaveByStatusPage({
  params,
  searchParams,
}: PageProps) {
  await requireRole(['users']);

  const { status } = await params;
  if (!status || !['pending', 'active', 'archive'].includes(status)) {
    notFound();
  }

  const { page, limit, search } = await parsePaginationParams(searchParams);
  const category = status as LeaveCategory;

  const [result, airline] = await Promise.all([
    getLeaveRequestsPaginatedByCategory(page, limit, category, search),
    getAirline(),
  ]);

  if (!airline) {
    throw new Error('Airline configuration not found');
  }

  const roles = await getCurrentUserRoles();
  const canViewUsers = hasRequiredRole(roles, ['users']);

  const headerTitle =
    category === 'pending'
      ? 'Pending Leave Requests'
      : category === 'active'
        ? 'Active Leave'
        : 'Leave Archive';

  return (
    <PageLayout
      title={headerTitle}
      description="Review and manage leave requests by status"
    >
      <LeaveStatusTabs current={category} />
      <LeaveTable
        leaveRequests={result.leaveRequests}
        total={result.total}
        limit={limit}
        airline={airline}
        showPilotName={true}
        baseUrl="/admin/leave"
        canViewUsers={canViewUsers}
      />
    </PageLayout>
  );
}
