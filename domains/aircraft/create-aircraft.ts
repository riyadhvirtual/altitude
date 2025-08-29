import { db } from '@/db';
import { aircraft } from '@/db/schema';

interface CreatedAircraft {
  id: string;
  name: string;
  livery: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function createAircraftRecord(
  name: string,
  livery: string
): Promise<CreatedAircraft> {
  // Always generate a unique internal ID for each aircraft+livery entry
  // Do not reuse external Infinite Flight aircraft IDs here, as multiple
  // liveries share the same external aircraftID and would conflict on PK
  const aircraftId = crypto.randomUUID();

  const result = await db
    .insert(aircraft)
    .values({
      id: aircraftId,
      name: name,
      livery: livery,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  if (result.length === 0) {
    throw new Error('Failed to create aircraft - no record returned');
  }

  return result[0];
}
