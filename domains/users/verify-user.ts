import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { users } from '@/db/schema';

export async function verifyUser(id: string) {
  await db
    .update(users)
    .set({ verified: true, updatedAt: new Date() })
    .where(eq(users.id, id));
}
