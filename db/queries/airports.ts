import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { airports } from '@/db/schema';

export async function getAirportNameByIcao(
  icao: string
): Promise<string | null> {
  const result = await db
    .select({ name: airports.name })
    .from(airports)
    .where(eq(airports.icao, icao))
    .limit(1);
  return result[0]?.name ?? null;
}

export async function getAirportInfoByIcao(
  icao: string
): Promise<{ name: string; country: string } | null> {
  const result = await db
    .select({
      name: airports.name,
      country: airports.country,
    })
    .from(airports)
    .where(eq(airports.icao, icao))
    .limit(1);
  return result[0] ?? null;
}
