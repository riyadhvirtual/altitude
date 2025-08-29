import { db } from '@/db';
import { multipliers } from '@/db/schema';

export async function createMultiplier(name: string, value: number) {
  const multiplierId = crypto.randomUUID();

  const newMultiplier = await db
    .insert(multipliers)
    .values({
      id: multiplierId,
      name: name,
      value: value,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return newMultiplier[0];
}
