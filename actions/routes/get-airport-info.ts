'use server';

import { getAirportInfoByIcao } from '@/db/queries/airports';

export async function getAirportInfoAction(icao: string) {
  try {
    const airportInfo = await getAirportInfoByIcao(icao);
    return {
      success: true,
      data: airportInfo,
    };
  } catch {
    return {
      success: false,
      error: 'Failed to fetch airport information',
    };
  }
}
