import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { multipliers } from '@/db/schema';

export async function editMultiplier(id: string, name: string, value: number) {
  const result = await db
    .update(multipliers)
    .set({ name: name, value: value, updatedAt: new Date() })
    .where(eq(multipliers.id, id));

  if (result.rowsAffected === 0) {
    throw new Error('Multiplier not found or not updated');
  }
}
