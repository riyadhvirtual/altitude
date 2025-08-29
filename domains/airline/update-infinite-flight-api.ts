import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { airline } from '@/db/schema';

export interface InfiniteFlightApiUpdateData {
  id: string;
  infiniteFlightApiKey?: string;
}

export async function updateInfiniteFlightApi(
  data: InfiniteFlightApiUpdateData
): Promise<void> {
  const existingAirline = await db
    .select({ id: airline.id })
    .from(airline)
    .where(eq(airline.id, data.id))
    .get();

  if (!existingAirline) {
    throw new Error('Airline not found');
  }

  const updateData = {
    updatedAt: new Date(),
    ...(data.infiniteFlightApiKey !== undefined && {
      infiniteFlightApiKey: data.infiniteFlightApiKey,
    }),
  };

  const result = await db
    .update(airline)
    .set(updateData)
    .where(eq(airline.id, data.id));

  if (result.rowsAffected === 0) {
    throw new Error(
      'Failed to update Infinite Flight API settings - no changes made'
    );
  }
}
