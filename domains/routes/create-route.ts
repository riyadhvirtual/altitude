import { randomUUID } from 'crypto';

import { db } from '@/db';
import { routeAircraft, routes, routesFlightNumbers } from '@/db/schema';

interface CreateRouteData {
  departureIcao: string;
  arrivalIcao: string;
  flightTime: number;
  details?: string;
  aircraftIds: string[];
  flightNumbers: string[];
}

export async function createRoute(data: CreateRouteData) {
  const {
    departureIcao,
    arrivalIcao,
    flightTime,
    details,
    aircraftIds,
    flightNumbers,
  } = data;

  const newRouteId = randomUUID();

  await db.transaction(async (tx) => {
    await tx.insert(routes).values({
      id: newRouteId,
      departureIcao,
      arrivalIcao,
      flightTime,
      details,
    });

    if (aircraftIds.length > 0) {
      await tx.insert(routeAircraft).values(
        aircraftIds.map((aircraftId) => ({
          id: randomUUID(),
          routeId: newRouteId,
          aircraftId,
        }))
      );
    }

    if (flightNumbers.length > 0) {
      await tx.insert(routesFlightNumbers).values(
        flightNumbers.map((flightNumber) => ({
          id: randomUUID(),
          routeId: newRouteId,
          flightNumber,
        }))
      );
    }
  });
}
