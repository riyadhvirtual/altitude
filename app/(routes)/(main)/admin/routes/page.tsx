import type { Metadata } from 'next';

import { AdminRoutesView } from '@/components/routes/admin-routes-view';
import type { FilterCondition } from '@/components/routes/route-filters-bar';
import {
  filterRoutesAdvanced,
  getAircraft,
  getRoutesPaginated,
  RouteFilterCondition,
} from '@/db/queries';
import { requireRole } from '@/lib/auth-check';
import { parsePaginationParams } from '@/lib/pagination';

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
  await requireRole(['routes']);

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const { page, limit } = await parsePaginationParams(searchParams);

  let routeFilters: RouteFilterCondition[] = [];
  if (resolvedSearchParams?.filters) {
    try {
      routeFilters = JSON.parse(resolvedSearchParams.filters);
    } catch {
      routeFilters = [];
    }
  }

  const hasAnyFilter = routeFilters.length > 0;

  const [{ routes, total }, aircraft] = await Promise.all([
    hasAnyFilter
      ? filterRoutesAdvanced(routeFilters, page, limit)
      : getRoutesPaginated(page, limit),
    getAircraft(),
  ]);

  const filters: FilterCondition[] = routeFilters
    .filter(
      (
        filter
      ): filter is RouteFilterCondition & {
        operator: FilterCondition['operator'];
      } =>
        !['before', 'after', 'is_empty', 'is_not_empty'].includes(
          filter.operator
        )
    )
    .map((filter) => ({
      id: filter.id,
      field: filter.field,
      operator: filter.operator,
      value: filter.value,
    }));

  return (
    <AdminRoutesView
      routes={routes}
      total={total}
      limit={limit}
      aircraft={aircraft}
      filters={filters}
    />
  );
}
