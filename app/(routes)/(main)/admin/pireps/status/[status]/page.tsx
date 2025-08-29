import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PageLayout } from '@/components/page-layout';
import { PirepsPagination } from '@/components/pireps/pireps-pagination';
import { PirepsStatusTabs } from '@/components/pireps/pireps-status-tabs';
import { StatusPirepsTable } from '@/components/pireps/status-pireps-table';
import { getAirline, getPirepsPaginated } from '@/db/queries';
import { getCurrentUserRoles, requireRole } from '@/lib/auth-check';
import { parsePaginationParams } from '@/lib/pagination';
import { hasRequiredRole } from '@/lib/roles';

interface PageProps {
  params: Promise<{
    status: string;
  }>;
  searchParams?: Promise<{
    page?: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { status } = await params;
  if (!status) {
    return {
      title: 'PIREPs',
    };
  }

  const statusTitle = status.charAt(0).toUpperCase() + status.slice(1);

  return {
    title: `${statusTitle} PIREPs`,
  };
}

export default async function PirepsByStatusPage({
  params,
  searchParams,
}: PageProps) {
  await requireRole(['pireps']);

  const { status } = await params;

  if (!status || !['pending', 'approved', 'denied'].includes(status)) {
    notFound();
  }

  const { page, limit } = await parsePaginationParams(searchParams, 20);
  const statusType = status as 'pending' | 'approved' | 'denied';

  const [pirepsResult, airline] = await Promise.all([
    getPirepsPaginated(page, limit, statusType),
    getAirline(),
  ]);

  if (!airline) {
    throw new Error('Airline not found');
  }

  const statusTitle = status.charAt(0).toUpperCase() + status.slice(1);
  const roles = await getCurrentUserRoles();
  const canViewUsers = hasRequiredRole(roles, ['users']);

  return (
    <PageLayout
      title={`${statusTitle} PIREPs`}
      description={`Review and manage ${status} flight reports from your pilots`}
    >
      <PirepsStatusTabs currentStatus={statusType} />
      <StatusPirepsTable
        pireps={pirepsResult.pireps}
        airline={airline}
        status={statusType}
        canViewUsers={canViewUsers}
      />
      <PirepsPagination
        currentPage={page}
        totalPages={Math.ceil(pirepsResult.total / limit)}
        total={pirepsResult.total}
        limit={limit}
        status={statusType}
      />
    </PageLayout>
  );
}
