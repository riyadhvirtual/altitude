import type { Metadata } from 'next';

import { PageLayout } from '@/components/page-layout';
import { ApplicationsTable } from '@/components/users/applications/applications-table';
import { getAirline, getUnverifiedUsersPaginated } from '@/db/queries';
import { requireRole } from '@/lib/auth-check';
import { parsePaginationParams } from '@/lib/pagination';

export function generateMetadata(): Metadata {
  return {
    title: 'User Applications',
  };
}

interface ApplicationsPageProps {
  searchParams?: Promise<{
    page?: string;
  }>;
}

export default async function ApplicationsPage({
  searchParams,
}: ApplicationsPageProps) {
  await requireRole(['users']);

  const { page, limit } = await parsePaginationParams(searchParams);

  const { users, total } = await getUnverifiedUsersPaginated(page, limit);
  const airline = await getAirline();

  return (
    <PageLayout
      title="User Applications"
      description="Review and manage pilot applications for your airline"
    >
      {airline && (
        <ApplicationsTable
          airline={airline}
          users={users}
          total={total}
          limit={limit}
        />
      )}
    </PageLayout>
  );
}
