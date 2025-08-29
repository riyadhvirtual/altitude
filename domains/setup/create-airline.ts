import { db } from '@/db';
import { airline } from '@/db/schema';

interface AirlineData {
  name: string;
  callsign: string;
  callsignMinRange?: number;
  callsignMaxRange?: number;
}

async function hasExistingAirline(): Promise<boolean> {
  const existingAirline = await db
    .select({ id: airline.id })
    .from(airline)
    .limit(1);

  return existingAirline.length > 0;
}

async function updateExistingAirline(data: AirlineData): Promise<void> {
  const result = await db.update(airline).set({
    name: data.name,
    callsign: data.callsign,
    callsignMinRange: data.callsignMinRange || 1,
    callsignMaxRange: data.callsignMaxRange || 999,
    setup: true,
    updatedAt: new Date(),
  });

  if (result.rowsAffected === 0) {
    throw new Error('Failed to update airline configuration');
  }
}

async function createNewAirline(data: AirlineData): Promise<void> {
  await db.insert(airline).values({
    id: crypto.randomUUID(),
    name: data.name,
    callsign: data.callsign,
    callsignMinRange: data.callsignMinRange || 1,
    callsignMaxRange: data.callsignMaxRange || 999,
    setup: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function upsertAirline(data: AirlineData): Promise<void> {
  const airlineExists = await hasExistingAirline();

  if (airlineExists) {
    await updateExistingAirline(data);
  } else {
    await createNewAirline(data);
  }
}
