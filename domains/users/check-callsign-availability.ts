import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { users } from '@/db/schema';

export async function checkCallsignAvailability(callsign: number) {
  const existingUser = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.callsign, callsign))
    .get();

  return !existingUser;
}
