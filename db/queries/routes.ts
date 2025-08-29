import { desc, eq, SQL, sql } from 'drizzle-orm';

import { db } from '@/db';
import {
  type Route,
  routeAircraft,
  routes,
  routesFlightNumbers,
} from '@/db/schema';

export type RouteWithNumbers = Route & {
  flightNumbers: string[];
  aircraftIds: string[];
};

export interface PaginatedResult<T> {
  routes: T[];
  total: number;
}

import type { FilterCondition, FilterOperator } from '@/types/database';

export type FilterField =
  | 'flightNumber'
  | 'departureIcao'
  | 'arrivalIcao'
  | 'aircraftId'
  | 'flightTime';

export interface RouteFilterCondition extends FilterCondition {
  field: FilterField;
  operator: FilterOperator;
}

export interface SimpleFilters {
  departureIcao?: string;
  arrivalIcao?: string;
  flightNumber?: string;
  aircraftId?: string;
  minFlightTime?: number;
  maxFlightTime?: number;
}

type RouteRow = {
  id: string;
  departureIcao: string;
  arrivalIcao: string;
  flightTime: number | null;
  details: string | null;
  createdAt: Date;
  updatedAt: Date;
  flightNumbers: string;
  aircraftIds: string;
};

const routeSelectFields = {
  id: routes.id,
  departureIcao: routes.departureIcao,
  arrivalIcao: routes.arrivalIcao,
  flightTime: routes.flightTime,
  details: routes.details,
  createdAt: routes.createdAt,
  updatedAt: routes.updatedAt,
  flightNumbers: sql<string>`COALESCE(GROUP_CONCAT(DISTINCT ${routesFlightNumbers.flightNumber}), '')`,
  aircraftIds: sql<string>`COALESCE(GROUP_CONCAT(DISTINCT ${routeAircraft.aircraftId}), '')`,
};

const transformRouteResult = (row: RouteRow): RouteWithNumbers => ({
  id: row.id,
  departureIcao: row.departureIcao,
  arrivalIcao: row.arrivalIcao,
  flightTime: row.flightTime ?? 0,
  details: row.details,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  flightNumbers: row.flightNumbers
    ? row.flightNumbers.split(',').filter(Boolean)
    : [],
  aircraftIds: row.aircraftIds
    ? row.aircraftIds.split(',').filter(Boolean)
    : [],
});

const createFlightNumberSubquery = (condition: SQL<boolean>): SQL<boolean> =>
  sql<boolean>`${routes.id} IN (SELECT ${routesFlightNumbers.routeId} FROM ${routesFlightNumbers} WHERE ${condition})`;

const createAircraftSubquery = (condition: SQL<boolean>): SQL<boolean> =>
  sql<boolean>`${routes.id} IN (SELECT ${routeAircraft.routeId} FROM ${routeAircraft} WHERE ${condition})`;

const buildStringCondition = (
  field: typeof routes.departureIcao | typeof routes.arrivalIcao,
  operator: FilterOperator,
  value: string | number | undefined
): SQL<boolean> => {
  const stringValue = String(value || '');

  switch (operator) {
    case 'contains':
      return sql<boolean>`upper(${field}) LIKE upper(${`%${stringValue}%`})`;
    case 'is':
      return sql<boolean>`upper(${field}) = upper(${stringValue})`;
    case 'is_not':
      return sql<boolean>`upper(${field}) != upper(${stringValue})`;
    case 'starts_with':
      return sql<boolean>`upper(${field}) LIKE upper(${`${stringValue}%`})`;
    case 'ends_with':
      return sql<boolean>`upper(${field}) LIKE upper(${`%${stringValue}`})`;
    default:
      return sql<boolean>`1 = 1`;
  }
};

const buildFlightNumberCondition = (
  operator: FilterOperator,
  value: string | number | undefined
): SQL<boolean> => {
  const stringValue = String(value || '');

  switch (operator) {
    case 'contains':
      return createFlightNumberSubquery(
        sql<boolean>`upper(${routesFlightNumbers.flightNumber}) LIKE upper(${`%${stringValue}%`})`
      );
    case 'is':
      return createFlightNumberSubquery(
        sql<boolean>`upper(${routesFlightNumbers.flightNumber}) = upper(${stringValue})`
      );
    case 'is_not':
      return createFlightNumberSubquery(
        sql<boolean>`upper(${routesFlightNumbers.flightNumber}) != upper(${stringValue})`
      );
    case 'starts_with':
      return createFlightNumberSubquery(
        sql<boolean>`upper(${routesFlightNumbers.flightNumber}) LIKE upper(${`${stringValue}%`})`
      );
    case 'ends_with':
      return createFlightNumberSubquery(
        sql<boolean>`upper(${routesFlightNumbers.flightNumber}) LIKE upper(${`%${stringValue}`})`
      );
    default:
      return sql<boolean>`1 = 1`;
  }
};

const buildAircraftCondition = (
  operator: FilterOperator,
  value: string | number | undefined
): SQL<boolean> => {
  const stringValue = String(value || '');

  switch (operator) {
    case 'is':
      return createAircraftSubquery(
        sql<boolean>`${routeAircraft.aircraftId} = ${stringValue}`
      );
    case 'is_not':
      return createAircraftSubquery(
        sql<boolean>`${routeAircraft.aircraftId} != ${stringValue}`
      );
    default:
      return sql<boolean>`1 = 1`;
  }
};

const buildFlightTimeCondition = (
  operator: FilterOperator,
  value: string | number | undefined
): SQL<boolean> => {
  const numericValue = Number(value || 0);

  switch (operator) {
    case 'is':
      return sql<boolean>`${routes.flightTime} = ${numericValue}`;
    case 'is_not':
      return sql<boolean>`${routes.flightTime} != ${numericValue}`;
    case 'greater_than':
      return sql<boolean>`${routes.flightTime} > ${numericValue}`;
    case 'less_than':
      return sql<boolean>`${routes.flightTime} < ${numericValue}`;
    case 'greater_equal':
      return sql<boolean>`${routes.flightTime} >= ${numericValue}`;
    case 'less_equal':
      return sql<boolean>`${routes.flightTime} <= ${numericValue}`;
    default:
      return sql<boolean>`1 = 1`;
  }
};

const buildFieldCondition = (condition: RouteFilterCondition): SQL<boolean> => {
  const { field, operator, value } = condition;

  switch (field) {
    case 'departureIcao':
      return buildStringCondition(routes.departureIcao, operator, value);
    case 'arrivalIcao':
      return buildStringCondition(routes.arrivalIcao, operator, value);
    case 'flightNumber':
      return buildFlightNumberCondition(operator, value);
    case 'aircraftId':
      return buildAircraftCondition(operator, value);
    case 'flightTime':
      return buildFlightTimeCondition(operator, value);
    default:
      return sql<boolean>`1 = 1`;
  }
};

const combineConditions = (conditions: SQL<boolean>[]): SQL<boolean> => {
  return conditions.length > 0
    ? conditions.reduce((prev, curr) => sql<boolean>`(${prev}) AND (${curr})`)
    : sql<boolean>`1 = 1`;
};

const buildSimpleFilterConditions = (
  filters: SimpleFilters
): SQL<boolean>[] => {
  const conditions: SQL<boolean>[] = [];
  const {
    departureIcao,
    arrivalIcao,
    flightNumber,
    aircraftId,
    minFlightTime,
    maxFlightTime,
  } = filters;

  if (departureIcao) {
    conditions.push(
      sql<boolean>`upper(${routes.departureIcao}) LIKE upper(${`%${departureIcao}%`})`
    );
  }

  if (arrivalIcao) {
    conditions.push(
      sql<boolean>`upper(${routes.arrivalIcao}) LIKE upper(${`%${arrivalIcao}%`})`
    );
  }

  if (flightNumber) {
    conditions.push(
      sql<boolean>`${routes.id} IN (SELECT ${routesFlightNumbers.routeId} FROM ${routesFlightNumbers} WHERE upper(${routesFlightNumbers.flightNumber}) LIKE upper(${`%${flightNumber}%`}))`
    );
  }

  if (aircraftId) {
    conditions.push(
      sql`${routes.id} IN (SELECT ${routeAircraft.routeId} FROM ${routeAircraft} WHERE ${routeAircraft.aircraftId} = ${aircraftId})`
    );
  }

  if (minFlightTime !== undefined) {
    conditions.push(sql<boolean>`${routes.flightTime} >= ${minFlightTime}`);
  }

  if (maxFlightTime !== undefined) {
    conditions.push(sql<boolean>`${routes.flightTime} <= ${maxFlightTime}`);
  }

  return conditions;
};

const buildPaginatedQuery = (
  whereCondition: SQL<boolean>,
  page: number,
  limit: number
) => {
  const offset = (page - 1) * limit;

  return db
    .select({
      ...routeSelectFields,
      totalCount: sql<number>`COUNT(*) OVER()`.as('totalCount'),
    })
    .from(routes)
    .leftJoin(routesFlightNumbers, eq(routes.id, routesFlightNumbers.routeId))
    .leftJoin(routeAircraft, eq(routes.id, routeAircraft.routeId))
    .where(whereCondition)
    .groupBy(routes.id)
    .orderBy(desc(routes.createdAt))
    .limit(limit)
    .offset(offset);
};

async function getRouteById(id: string): Promise<RouteWithNumbers | null> {
  const result = await db
    .select(routeSelectFields)
    .from(routes)
    .leftJoin(routesFlightNumbers, eq(routes.id, routesFlightNumbers.routeId))
    .leftJoin(routeAircraft, eq(routes.id, routeAircraft.routeId))
    .where(eq(routes.id, id))
    .groupBy(routes.id)
    .get();

  return result ? transformRouteResult(result as RouteRow) : null;
}

async function getRoutesPaginated(
  page: number,
  limit: number
): Promise<PaginatedResult<RouteWithNumbers>> {
  const result = await buildPaginatedQuery(sql<boolean>`1 = 1`, page, limit);

  return {
    routes: result.map(({ ...route }) =>
      transformRouteResult(route as RouteRow)
    ),
    total: result[0]?.totalCount ?? 0,
  };
}

async function searchRoutes(
  term: string,
  page: number,
  limit: number
): Promise<PaginatedResult<RouteWithNumbers>> {
  const searchCondition = sql<boolean>`(
    upper(${routes.departureIcao}) LIKE upper(${`%${term}%`}) OR
    upper(${routes.arrivalIcao}) LIKE upper(${`%${term}%`}) OR
    ${routes.id} IN (
      SELECT ${routesFlightNumbers.routeId}
      FROM ${routesFlightNumbers}
      WHERE upper(${routesFlightNumbers.flightNumber}) LIKE upper(${`%${term}%`})
    )
  )`;

  const result = await buildPaginatedQuery(searchCondition, page, limit);

  return {
    routes: result.map(({ ...route }) =>
      transformRouteResult(route as RouteRow)
    ),
    total: result[0]?.totalCount ?? 0,
  };
}

async function filterRoutes(
  filters: SimpleFilters,
  page: number,
  limit: number
): Promise<PaginatedResult<RouteWithNumbers>> {
  const conditions = buildSimpleFilterConditions(filters);
  const combinedCondition = combineConditions(conditions);

  const result = await buildPaginatedQuery(combinedCondition, page, limit);

  return {
    routes: result.map(({ ...route }) =>
      transformRouteResult(route as RouteRow)
    ),
    total: result[0]?.totalCount ?? 0,
  };
}

async function filterRoutesAdvanced(
  filters: RouteFilterCondition[],
  page: number,
  limit: number
): Promise<PaginatedResult<RouteWithNumbers>> {
  const conditions = filters.map(buildFieldCondition);
  const combinedCondition = combineConditions(conditions);

  const result = await buildPaginatedQuery(combinedCondition, page, limit);

  return {
    routes: result.map(({ ...route }) =>
      transformRouteResult(route as RouteRow)
    ),
    total: result[0]?.totalCount ?? 0,
  };
}

export {
  filterRoutes,
  filterRoutesAdvanced,
  getRouteById,
  getRoutesPaginated,
  searchRoutes,
};
