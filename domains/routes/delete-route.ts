import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { routeAircraft, routes, routesFlightNumbers } from '@/db/schema';

export async function deleteRoute(id: string) {
  await db.transaction(async (tx) => {
    await tx.delete(routeAircraft).where(eq(routeAircraft.routeId, id));
    await tx
      .delete(routesFlightNumbers)
      .where(eq(routesFlightNumbers.routeId, id));
    await tx.delete(routes).where(eq(routes.id, id));
  });
}
