import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';

import { db } from '@/db';
import { airports } from '@/db/schema';

interface AirportRecord {
  id: string;
  ident: string;
  iata_code: string;
  name: string;
  iso_country: string;
  continent: string;
  latitude_deg: string;
  longitude_deg: string;
  elevation_ft: string;
  type: string;
}

async function checkAirportsDataFile(): Promise<void> {
  const csvPath = path.join(process.cwd(), 'resources', 'world-airports.csv');

  if (!fs.existsSync(csvPath)) {
    throw new Error(
      'Airport data file not found. Please ensure world-airports.csv exists in the resources directory.'
    );
  }
}

async function hasExistingAirports(): Promise<boolean> {
  const existingAirports = await db
    .select({ id: airports.id })
    .from(airports)
    .limit(1);
  return existingAirports.length > 0;
}

export async function importAirports(): Promise<{
  imported: number;
  total: number;
}> {
  await checkAirportsDataFile();

  const csvPath = path.join(process.cwd(), 'resources', 'world-airports.csv');
  const csv = fs.readFileSync(csvPath, 'utf8');

  const records = parse(csv, {
    columns: true,
    skip_empty_lines: true,
  }) as AirportRecord[];

  const keepTypes = ['large_airport', 'medium_airport', 'small_airport'];

  const filtered = records.filter((r) => {
    if (!keepTypes.includes(r.type)) {
      return false;
    }
    // valid ICAO (3 or 4 uppercase letters)
    if (!r.ident.match(/^[A-Z]{3,4}$/)) {
      return false;
    }
    return true;
  });

  const toInsert = filtered.map((r) => ({
    id: r.id,
    icao: r.ident,
    iata: r.iata_code || null,
    name: r.name,
    country: r.iso_country,
    continent: r.continent,
    latitude: parseFloat(r.latitude_deg),
    longitude: parseFloat(r.longitude_deg),
    elevation: r.elevation_ft ? parseInt(r.elevation_ft, 10) : null,
    type: r.type,
  }));

  // sqlite only allows 999 variables per statement
  const varsPerRow = Object.keys(toInsert[0]).length;
  const MAX_SQLITE_VARS = 999;
  const chunkSize = Math.floor(MAX_SQLITE_VARS / varsPerRow);

  let imported = 0;

  await db.transaction(async (tx) => {
    for (let i = 0; i < toInsert.length; i += chunkSize) {
      const batch = toInsert.slice(i, i + chunkSize);
      await tx.insert(airports).values(batch);
      imported += batch.length;
    }
  });

  return {
    imported,
    total: filtered.length,
  };
}

export async function importAirportsIfNeeded(): Promise<{
  imported: number;
  total: number;
  skipped: boolean;
}> {
  const airportsExist = await hasExistingAirports();

  if (airportsExist) {
    return {
      imported: 0,
      total: 0,
      skipped: true,
    };
  }

  const result = await importAirports();

  return {
    ...result,
    skipped: false,
  };
}
