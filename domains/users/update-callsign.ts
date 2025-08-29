import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { airline, users } from '@/db/schema';
import { parseRolesField } from '@/lib/roles';

interface UpdateCallsignData {
  userId: string;
  callsign: number;
}

export async function updateCallsign({ userId, callsign }: UpdateCallsignData) {
  // Check target user's roles to determine if range should be enforced
  const userRow = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .get();

  const roles = parseRolesField(userRow?.role ?? null);
  const isStaff = roles.length > 0; // pilots typically have no roles

  if (!isStaff) {
    // Enforce range for pilots only
    const airlineData = await db
      .select({
        min: airline.callsignMinRange,
        max: airline.callsignMaxRange,
      })
      .from(airline)
      .get();

    const min = airlineData?.min ?? null;
    const max = airlineData?.max ?? null;

    if (min !== null && max !== null && (callsign < min || callsign > max)) {
      throw new Error(`Callsign must be between ${min} and ${max}`);
    }
  }

  await db
    .update(users)
    .set({ callsign, updatedAt: new Date() })
    .where(eq(users.id, userId));
}
