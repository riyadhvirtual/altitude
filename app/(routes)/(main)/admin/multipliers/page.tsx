import type { Metadata } from 'next';

import { AdminPage, CreateButton } from '@/components/admin/admin-page';
import { AdminSearchBar } from '@/components/admin/admin-search-bar';
import CreateMultiplierDialog from '@/components/multipliers/create-multiplier-dialog';
import { MultipliersTable } from '@/components/multipliers/multipliers-table';
import { countPirepsByMultiplier, getMultipliersPaginated } from '@/db/queries';
import { requireRole } from '@/lib/auth-check';
import { parsePaginationParams } from '@/lib/pagination';

export function generateMetadata(): Metadata {
  return {
    title: 'Multipliers',
  };
}

interface MultipliersPageProps {
  searchParams?: Promise<{
    page?: string;
    q?: string;
  }>;
}

export default async function MultipliersPage({
  searchParams,
}: MultipliersPageProps) {
  await requireRole(['multipliers']);

  const { page, search, limit } = await parsePaginationParams(searchParams);

  const { multipliers, total } = await getMultipliersPaginated(
    page,
    limit,
    search
  );

  const multipliersWithPirepCounts = await Promise.all(
    multipliers.map(async (multiplier) => ({
      ...multiplier,
      pirepCount: await countPirepsByMultiplier(multiplier.id),
    }))
  );

  return (
    <AdminPage
      title="Multipliers"
      description="Configure flight time multipliers for special routes and events"
      searchBar={<AdminSearchBar placeholder="Search multiplier / value..." />}
      createDialog={
        <CreateMultiplierDialog>
          <CreateButton text="Add Multiplier" />
        </CreateMultiplierDialog>
      }
      table={
        <MultipliersTable
          multipliers={multipliersWithPirepCounts}
          total={total}
          limit={limit}
        />
      }
    />
  );
}
