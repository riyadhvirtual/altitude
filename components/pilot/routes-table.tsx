'use client';

import { Map } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchRoutesAction } from '@/actions/routes/search-routes';
import { ActiveFilters } from '@/components/routes/active-filters';
import { RouteDetailsDialog } from '@/components/routes/route-details-dialog';
import {
  type FilterCondition,
  RouteFiltersBar,
} from '@/components/routes/route-filters-bar';
import { Button } from '@/components/ui/button';
import { DataPagination } from '@/components/ui/data-pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatHoursMinutes } from '@/lib/utils';

interface RouteItem {
  id: string;
  departureIcao: string;
  arrivalIcao: string;
  flightTime: number;
  details?: string | null;
  flightNumbers?: string[];
  aircraftIds?: string[];
}

interface RoutesViewProps {
  routes: RouteItem[];
  total: number;
  limit?: number;
  aircraft: { id: string; name: string; livery?: string }[];
  filters: FilterCondition[];
}

function useRouteFilterParams() {
  const [filtersParam, setFiltersParam] = useQueryState(
    'filters',
    parseAsString
  );

  const filters = useMemo(() => {
    if (!filtersParam) {
      return [];
    }
    try {
      return JSON.parse(filtersParam) as FilterCondition[];
    } catch {
      return [];
    }
  }, [filtersParam]);

  const setFilters = useCallback(
    async (newFilters: FilterCondition[]) => {
      if (newFilters.length === 0) {
        await setFiltersParam(null);
      } else {
        await setFiltersParam(JSON.stringify(newFilters));
      }
    },
    [setFiltersParam]
  );

  return { filters, setFilters };
}

export function RoutesTable({
  routes,
  total,
  limit = 10,
  aircraft,
}: RoutesViewProps) {
  const router = useRouter();
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));

  const { filters: filtersFromParams, setFilters } = useRouteFilterParams();

  const [routesState, setRoutesState] = useState<RouteItem[]>(routes);
  const [totalState, setTotalState] = useState(total);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [editingFilter, setEditingFilter] = useState<FilterCondition | null>(
    null
  );

  const { execute: fetchRoutes, isExecuting } = useAction(fetchRoutesAction, {
    onSuccess: ({ data }) => {
      setRoutesState(data?.routes || []);
      setTotalState(data?.total || 0);
      setIsInitialLoad(false);
    },
  });

  useEffect(() => {
    fetchRoutes({ page, limit, filters: filtersFromParams });
  }, [page, filtersFromParams, fetchRoutes, limit]);

  const handleFiltersChange = async (newFilters: FilterCondition[]) => {
    await Promise.all([setFilters(newFilters), setPage(1)]);
  };

  const handlePageChange = async (newPage: number) => {
    await setPage(newPage);
    // fetch triggered automatically
  };

  const handleEditFilter = (filter: FilterCondition) => {
    setEditingFilter(filter);
  };

  const totalPages = Math.ceil(totalState / limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1 w-full md:w-auto">
          <h3 className="font-medium text-2xl md:text-3xl text-foreground break-normal">
            Routes
          </h3>
          <p className="text-muted-foreground">
            Browse available flight routes and plan your next flights
          </p>
        </div>
        <div className="flex-shrink-0">
          <RouteFiltersBar
            aircraft={aircraft}
            currentFilters={filtersFromParams}
            isExecuting={isExecuting && !isInitialLoad}
            onFiltersChange={handleFiltersChange}
            showFilterButtonOnly={true}
            editingFilter={editingFilter}
            onEditFilter={handleEditFilter}
            onClearEditingFilter={() => setEditingFilter(null)}
          />
        </div>
      </div>

      <ActiveFilters
        aircraft={aircraft}
        currentFilters={filtersFromParams}
        isExecuting={isExecuting && !isInitialLoad}
        onFiltersChange={handleFiltersChange}
        onEditFilter={handleEditFilter}
      />

      <section className="space-y-4">
        <div className="overflow-hidden rounded-md border border-border bg-panel shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="bg-muted/50 font-semibold text-foreground">
                  Flight Numbers
                </TableHead>
                <TableHead className="bg-muted/50 font-semibold text-foreground">
                  Departure
                </TableHead>
                <TableHead className="bg-muted/50 font-semibold text-foreground">
                  Arrival
                </TableHead>
                <TableHead className="bg-muted/50 font-semibold text-foreground">
                  Flight Time
                </TableHead>
                <TableHead className="w-[180px] bg-muted/50 font-semibold text-foreground text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {routesState.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="px-6 py-12 text-center text-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Map className="h-6 w-6 text-foreground" />
                      No routes found
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                routesState.map((route) => (
                  <TableRow
                    key={route.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <TableCell className="text-foreground">
                      <div className="flex flex-wrap gap-1">
                        {(() => {
                          const nums = route.flightNumbers || [];
                          const visible = nums.slice(0, 3);
                          return (
                            <>
                              {visible.map((n) => (
                                <span
                                  key={n}
                                  className="rounded px-2 py-0.5 text-xs bg-panel-accent text-panel-accent-foreground dark:bg-nav-hover dark:text-panel-foreground uppercase"
                                >
                                  {n}
                                </span>
                              ))}
                              {nums.length > 3 && (
                                <span className="rounded px-2 py-0.5 text-xs bg-panel-accent text-panel-accent-foreground dark:bg-nav-hover dark:text-panel-foreground">
                                  +{nums.length - 3}
                                </span>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-foreground uppercase">
                      {route.departureIcao}
                    </TableCell>
                    <TableCell className="font-medium text-foreground uppercase">
                      {route.arrivalIcao}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {formatHoursMinutes(route.flightTime)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <RouteDetailsDialog
                          departureIcao={route.departureIcao}
                          arrivalIcao={route.arrivalIcao}
                          flightNumbers={route.flightNumbers}
                          flightTime={route.flightTime}
                          aircraftNames={aircraft
                            .filter((a) => route.aircraftIds?.includes(a.id))
                            .map((a) =>
                              a.livery ? `${a.name} (${a.livery})` : a.name
                            )}
                          trigger={
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                          }
                        />
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => {
                            const flightTimeHours = Math.floor(
                              route.flightTime / 60
                            );
                            const flightTimeMinutes = route.flightTime % 60;
                            const singleFlightNumber =
                              route.flightNumbers?.length === 1
                                ? route.flightNumbers[0]
                                : undefined;
                            const singleAircraft =
                              route.aircraftIds?.length === 1
                                ? route.aircraftIds[0]
                                : undefined;

                            // Find aircraft filter if any
                            const aircraftFilter = filtersFromParams.find(
                              (f) =>
                                f.field === 'aircraftId' && f.operator === 'is'
                            );

                            const params = new URLSearchParams({
                              ...(singleFlightNumber && {
                                flightNumber: singleFlightNumber,
                              }),
                              departureIcao: route.departureIcao,
                              arrivalIcao: route.arrivalIcao,
                              flightTimeHours: flightTimeHours.toString(),
                              flightTimeMinutes: flightTimeMinutes.toString(),
                              ...(singleAircraft && {
                                aircraftId: singleAircraft,
                              }),
                              ...(aircraftFilter?.value &&
                                !singleAircraft && {
                                  aircraftId: aircraftFilter.value.toString(),
                                }),
                            });

                            router.push(`/pireps?${params.toString()}`);
                          }}
                        >
                          File PIREP
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-end">
            <DataPagination
              page={page}
              totalPages={totalPages}
              totalItems={totalState}
              itemsPerPage={limit}
              itemLabelPlural="routes"
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </section>
    </div>
  );
}
