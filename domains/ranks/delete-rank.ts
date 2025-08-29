import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { ranks } from '@/db/schema';

export async function deleteRank(id: string) {
  const existingRank = await db
    .select()
    .from(ranks)
    .where(eq(ranks.id, id))
    .limit(1);

  if (existingRank.length === 0) {
    throw new Error('Rank not found');
  }

  await db.delete(ranks).where(eq(ranks.id, id));

  return existingRank[0];
}
