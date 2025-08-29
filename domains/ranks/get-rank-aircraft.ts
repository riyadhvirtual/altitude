import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { rankAircraft, ranks } from '@/db/schema';

export async function getRankAircraft(rankId: string) {
  const rank = await db
    .select({ allowAllAircraft: ranks.allowAllAircraft })
    .from(ranks)
    .where(eq(ranks.id, rankId))
    .get();

  if (!rank) {
    throw new Error('Rank not found');
  }

  // If rank allows all aircraft, return empty array, all allowed
  if (rank.allowAllAircraft) {
    return { aircraftIds: [], allowAllAircraft: true };
  }

  const aircraftIds = await db
    .select({ aircraftId: rankAircraft.aircraftId })
    .from(rankAircraft)
    .where(eq(rankAircraft.rankId, rankId));

  return {
    aircraftIds: aircraftIds.map((a) => a.aircraftId),
    allowAllAircraft: false,
  };
}
