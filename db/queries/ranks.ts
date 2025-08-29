import { desc, gt, lte, sql } from 'drizzle-orm';

import { db } from '@/db';
import { type Rank, ranks } from '@/db/schema';

/**
 * Find the highest rank whose minimumFlightTime ≤ flightTimeHours
 * This determines what rank a user should have based on their flight time
 */
async function getUserRank(
  flightTimeMinutes: number
): Promise<Rank | undefined> {
  const flightTimeHours = flightTimeMinutes / 60;

  return db
    .select()
    .from(ranks)
    .where(lte(ranks.minimumFlightTime, flightTimeHours))
    .orderBy(desc(ranks.minimumFlightTime))
    .get();
}

async function getRankProgression(flightTimeMinutes: number): Promise<{
  currentRank: Rank | undefined;
  nextRank: Rank | undefined;
  hoursToNextRank: number | undefined;
}> {
  const flightTimeHours = flightTimeMinutes / 60;

  const currentRank = await getUserRank(flightTimeMinutes);

  const nextRank = await db
    .select()
    .from(ranks)
    .where(gt(ranks.minimumFlightTime, flightTimeHours))
    .orderBy(ranks.minimumFlightTime)
    .get();

  const hoursToNextRank = nextRank
    ? nextRank.minimumFlightTime - flightTimeHours
    : undefined;

  return {
    currentRank,
    nextRank,
    hoursToNextRank,
  };
}

async function getRanksPaginated(
  page: number,
  limit: number,
  search?: string
): Promise<{ ranks: Rank[]; total: number }> {
  const offset = (page - 1) * limit;

  const whereCondition = search
    ? sql<boolean>`${ranks.name} LIKE ${`%${search}%`} COLLATE NOCASE`
    : sql<boolean>`1 = 1`;

  const rows = await db
    .select({
      rank: ranks,
      totalCount: sql<number>`COUNT(*) OVER()`.as('totalCount'),
    })
    .from(ranks)
    .where(whereCondition)
    .orderBy(ranks.minimumFlightTime)
    .limit(limit)
    .offset(offset);

  return {
    ranks: rows.map((r) => r.rank),
    total: rows[0]?.totalCount ?? 0,
  };
}

export { getRankProgression, getRanksPaginated, getUserRank };
