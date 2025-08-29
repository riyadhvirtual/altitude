import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { multipliers } from '@/db/schema';

export async function deleteMultiplier(id: string) {
  const existingMultiplier = await db
    .select()
    .from(multipliers)
    .where(eq(multipliers.id, id))
    .limit(1);

  if (existingMultiplier.length === 0) {
    throw new Error('Multiplier not found');
  }

  await db.delete(multipliers).where(eq(multipliers.id, id));

  return existingMultiplier[0];
}
