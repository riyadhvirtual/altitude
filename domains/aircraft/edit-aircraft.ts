import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { aircraft } from '@/db/schema';

interface EditAircraftData {
  id: string;
  name: string;
  livery: string;
}

export async function editAircraftRecord({
  id,
  name,
  livery,
}: EditAircraftData) {
  const result = await db
    .update(aircraft)
    .set({ name, livery, updatedAt: new Date() })
    .where(eq(aircraft.id, id));

  if (result.rowsAffected === 0) {
    throw new Error('Aircraft not found or not updated');
  }
}
