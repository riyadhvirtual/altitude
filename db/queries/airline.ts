import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { type Airline, airline } from '@/db/schema';

async function getAirline(): Promise<Airline | undefined> {
  return db.select().from(airline).get();
}

async function isSetupComplete(): Promise<boolean> {
  try {
    const result = await db
      .select({ setup: airline.setup })
      .from(airline)
      .where(eq(airline.setup, true))
      .limit(1);

    return result.length > 0;
  } catch {
    return false;
  }
}

export { getAirline, isSetupComplete };
