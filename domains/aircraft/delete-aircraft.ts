import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { aircraft } from '@/db/schema';

export async function deleteAircraftRecord(id: string): Promise<void> {
  const result = await db.delete(aircraft).where(eq(aircraft.id, id));

  if (result.rowsAffected === 0) {
    throw new Error('Failed to delete aircraft - no changes made');
  }
}
