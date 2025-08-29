import type { Metadata } from 'next';

import { RoutesTable } from '@/components/pilot/routes-table';
import { type FilterCondition } from '@/components/routes/route-filters-bar';
import {
  filterRoutesAdvanced,
  getAircraft,
  getRoutesPaginated,
  RouteFilterCondition,
} from '@/db/queries';
import { requireAuth } from '@/lib/auth-check';

export function generateMetadata(): Metadata {
  return {
    title: 'Routes',
  };
}

interface RoutesPageProps {
  searchParams?: Promise<{
    page?: string;
    filters?: string;
  }>;
}

export default async function RoutesPage({ searchParams }: RoutesPageProps) {
  await requireAuth();

  const resolvedParams = searchParams ? await searchParams : {};
  const page = resolvedParams?.page ? parseInt(resolvedParams.page, 10) : 1;
  const limit = 10;

  let filters: FilterCondition[] = [];
  if (resolvedParams?.filters) {
    try {
      filters = JSON.parse(resolvedParams.filters);
    } catch {
      filters = [];
    }
  }

  const hasAnyFilter = filters.length > 0;

  const [{ routes, total }, aircraft] = await Promise.all([
    hasAnyFilter
      ? filterRoutesAdvanced(filters as RouteFilterCondition[], page, limit)
      : getRoutesPaginated(page, limit),
    getAircraft(),
  ]);

  return (
    <RoutesTable
      routes={routes}
      total={total}
      limit={limit}
      aircraft={aircraft}
      filters={filters}
    />
  );
}
