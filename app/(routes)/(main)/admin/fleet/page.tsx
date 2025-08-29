import type { Metadata } from 'next';

import { AdminPage, CreateButton } from '@/components/admin/admin-page';
import { AdminSearchBar } from '@/components/admin/admin-search-bar';
import { AdminTable } from '@/components/admin/admin-table';
import { AircraftList } from '@/components/fleet/aircraft-table';
import CreateAircraftDialog from '@/components/fleet/create-aircraft-dialog';
import { countPirepsByAircraft, getAircraftPaginated } from '@/db/queries';
import { requireRole } from '@/lib/auth-check';
import { parsePaginationParams } from '@/lib/pagination';

export function generateMetadata(): Metadata {
  return {
    title: 'Fleet',
  };
}

interface FleetPageProps {
  searchParams?: Promise<{
    page?: string;
    q?: string;
  }>;
}

export default async function FleetPage({ searchParams }: FleetPageProps) {
  await requireRole(['fleet']);

  const { page, search, limit } = await parsePaginationParams(searchParams);

  const { aircraft, total } = await getAircraftPaginated(page, limit, search);

  const aircraftWithPirepCounts = await Promise.all(
    aircraft.map(async (ac) => ({
      ...ac,
      pirepCount: await countPirepsByAircraft(ac.id),
    }))
  );

  return (
    <AdminPage
      title="Fleet"
      description="Manage your aircraft fleet and livery configurations"
      searchBar={<AdminSearchBar placeholder="Search aircraft / livery..." />}
      createDialog={
        <CreateAircraftDialog>
          <CreateButton text="Add Aircraft" />
        </CreateAircraftDialog>
      }
      table={
        <AdminTable
          data={aircraftWithPirepCounts}
          total={total}
          limit={limit}
          TableComponent={AircraftList}
          dataKey="aircraft"
        />
      }
    />
  );
}
