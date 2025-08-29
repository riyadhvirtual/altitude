import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { routeAircraft, routes, routesFlightNumbers } from '@/db/schema';

interface UpdateRouteData {
  id: string;
  departureIcao: string;
  arrivalIcao: string;
  flightTime: number;
  details?: string;
  aircraftIds: string[];
  flightNumbers: string[];
}

export async function updateRoute(data: UpdateRouteData) {
  const {
    id,
    departureIcao,
    arrivalIcao,
    flightTime,
    details,
    aircraftIds,
    flightNumbers,
  } = data;

  await db.transaction(async (tx) => {
    await tx
      .update(routes)
      .set({
        departureIcao,
        arrivalIcao,
        flightTime,
        details,
        updatedAt: new Date(),
      })
      .where(eq(routes.id, id));

    // reset mappings
    await tx.delete(routeAircraft).where(eq(routeAircraft.routeId, id));
    await tx
      .delete(routesFlightNumbers)
      .where(eq(routesFlightNumbers.routeId, id));

    if (aircraftIds.length) {
      await tx.insert(routeAircraft).values(
        aircraftIds.map((aid) => ({
          id: randomUUID(),
          routeId: id,
          aircraftId: aid,
        }))
      );
    }
    if (flightNumbers.length) {
      await tx.insert(routesFlightNumbers).values(
        flightNumbers.map((fn) => ({
          id: randomUUID(),
          routeId: id,
          flightNumber: fn,
        }))
      );
    }
  });
}
