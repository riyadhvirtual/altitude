import { eq, sql } from 'drizzle-orm';

import { db } from '@/db';
import { type Multiplier, multipliers, pireps } from '@/db/schema';

async function getMultipliers(): Promise<Multiplier[]> {
  return db.select().from(multipliers).orderBy(multipliers.createdAt);
}

async function getMultipliersPaginated(
  page: number,
  limit: number,
  search?: string
): Promise<{ multipliers: Multiplier[]; total: number }> {
  const offset = (page - 1) * limit;

  const searchCondition = search
    ? sql<boolean>`(
        ${multipliers.name}   LIKE ${`%${search}%`} COLLATE NOCASE
        OR CAST(${multipliers.value} AS TEXT) LIKE ${`%${search}%`}
      )`
    : sql<boolean>`1 = 1`;

  const rows = await db
    .select({
      id: multipliers.id,
      name: multipliers.name,
      value: multipliers.value,
      createdAt: multipliers.createdAt,
      updatedAt: multipliers.updatedAt,
      totalCount: sql<number>`COUNT(*) OVER()`.as('totalCount'),
    })
    .from(multipliers)
    .where(searchCondition)
    .orderBy(multipliers.createdAt)
    .limit(limit)
    .offset(offset);

  return {
    multipliers: rows.map(({ ...m }) => m) as Multiplier[],
    total: rows[0]?.totalCount ?? 0,
  };
}

async function countPirepsByMultiplier(multiplierId: string): Promise<number> {
  const row = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(pireps)
    .where(eq(pireps.multiplierId, multiplierId))
    .get();

  return row?.count ?? 0;
}

async function getMultiplierValue(multiplierId: string): Promise<number> {
  const multiplier = await db
    .select({ value: multipliers.value })
    .from(multipliers)
    .where(eq(multipliers.id, multiplierId))
    .get();

  return multiplier?.value ?? 1;
}

export {
  countPirepsByMultiplier,
  getMultipliers,
  getMultipliersPaginated,
  getMultiplierValue,
};
