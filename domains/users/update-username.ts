import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { users } from '@/db/schema';

interface UpdateUsernameData {
  userId: string;
  name: string;
}

export async function updateUsername({ userId, name }: UpdateUsernameData) {
  await db
    .update(users)
    .set({ name, updatedAt: new Date() })
    .where(eq(users.id, userId));
}
