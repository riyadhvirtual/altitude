import type { Metadata } from 'next';

import { AdminPage } from '@/components/admin/admin-page';
import { AdminSearchBar } from '@/components/admin/admin-search-bar';
import { InactivityTable } from '@/components/inactivity/inactivity-table';
import { getAirline, getInactiveUsersPaginated } from '@/db/queries';
import { getCurrentUserRoles, requireRole } from '@/lib/auth-check';
import { parsePaginationParams } from '@/lib/pagination';
import { hasRequiredRole } from '@/lib/roles';

export function generateMetadata(): Metadata {
  return {
    title: 'Inactive Pilots',
  };
}

interface InactivityPageProps {
  searchParams?: Promise<{
    page?: string;
    q?: string;
  }>;
}

export default async function InactivityPage({
  searchParams,
}: InactivityPageProps) {
  await requireRole(['users']);

  const { page, search, limit } = await parsePaginationParams(searchParams);

  const [inactiveData, airline] = await Promise.all([
    getInactiveUsersPaginated(page, limit, search),
    getAirline(),
  ]);

  const { users, total } = inactiveData;

  if (!airline) {
    throw new Error('Airline configuration not found');
  }

  return (
    <AdminPage
      title="Inactive Pilots"
      description="Monitor and manage pilots who haven't been active recently"
      searchBar={<AdminSearchBar placeholder="Search inactive users..." />}
      createDialog={<></>}
      table={
        <InactivityTable
          airline={airline}
          users={users}
          total={total}
          limit={limit}
          canViewUsers={hasRequiredRole(await getCurrentUserRoles(), ['users'])}
        />
      }
    />
  );
}
