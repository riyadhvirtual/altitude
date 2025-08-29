'use client';

import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { useCallback, useMemo } from 'react';

import {
  type FilterCondition,
  RouteFiltersBar,
} from '@/components/routes/route-filters-bar';

interface AircraftWithLivery {
  id: string;
  name: string;
  livery?: string;
}

interface AdminRouteFiltersHeaderProps {
  aircraft: AircraftWithLivery[];
}

export default function AdminRouteFiltersHeader({
  aircraft,
}: AdminRouteFiltersHeaderProps) {
  const [_page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [filtersParam, setFiltersParam] = useQueryState(
    'filters',
    parseAsString
  );

  const filters = useMemo(() => {
    if (!filtersParam) {
      return [] as FilterCondition[];
    }
    try {
      return JSON.parse(filtersParam) as FilterCondition[];
    } catch {
      return [] as FilterCondition[];
    }
  }, [filtersParam]);

  const handleFiltersChange = useCallback(
    async (newFilters: FilterCondition[]) => {
      await Promise.all([
        setFiltersParam(
          newFilters.length === 0 ? null : JSON.stringify(newFilters)
        ),
        setPage(1),
      ]);
    },
    [setFiltersParam, setPage]
  );

  return (
    <RouteFiltersBar
      aircraft={aircraft}
      currentFilters={filters}
      isExecuting={false}
      onFiltersChange={handleFiltersChange}
    />
  );
}
