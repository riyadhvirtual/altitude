import type { Metadata } from 'next';

import { AdminPage } from '@/components/admin/admin-page';
import { AdminSearchBar } from '@/components/admin/admin-search-bar';
import { UsersTable } from '@/components/users/users-table';
import { getAirline, getUsersPaginated } from '@/db/queries';
import { requireRole } from '@/lib/auth-check';
import { parsePaginationParams } from '@/lib/pagination';

export function generateMetadata(): Metadata {
  return {
    title: 'Users',
  };
}

interface UsersPageProps {
  searchParams?: Promise<{
    page?: string;
    q?: string;
  }>;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  await requireRole(['users']);

  const { page, search, limit } = await parsePaginationParams(searchParams);

  const [usersResult, airline] = await Promise.all([
    getUsersPaginated(page, limit, search),
    getAirline(),
  ]);

  const { users, total } = usersResult;

  return (
    <AdminPage
      title="Users"
      description="Manage your pilots and their account information"
      searchBar={<AdminSearchBar placeholder="Search users..." />}
      createDialog={<></>}
      table={
        airline && (
          <UsersTable
            airline={airline}
            users={users}
            total={total}
            limit={limit}
          />
        )
      }
    />
  );
}
