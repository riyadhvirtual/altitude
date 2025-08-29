import { db } from '@/db';
import { airline } from '@/db/schema';
import { decrypt } from '@/lib/encryption';
import type { IFUsersResponse, UserStats } from '@/types/if';
import type { LiveriesResponse } from '@/types/shared';

export async function getIFUserStats(
  discourseNames: string[]
): Promise<UserStats[]> {
  try {
    const airlineData = await db.select().from(airline).get();

    if (!airlineData?.infiniteFlightApiKey) {
      throw new Error('Infinite Flight API key not configured');
    }

    const apiKey = decrypt(airlineData.infiniteFlightApiKey);
    const API_URL = 'https://api.infiniteflight.com/public/v2/users';

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        discourseNames,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch Infinite Flight data (${response.status})`
      );
    }

    const data: IFUsersResponse = await response.json();

    if (data.errorCode !== 0) {
      throw new Error(`Infinite Flight API returned error: ${data.errorCode}`);
    }

    return data.result;
  } catch {
    throw new Error('Failed to fetch Infinite Flight data');
  }
}

export async function getIFUserByDiscourseUsername(
  discourseUsername: string
): Promise<UserStats | null> {
  try {
    const results = await getIFUserStats([discourseUsername]);
    return (
      results.find((user) => user.discourseUsername === discourseUsername) ||
      null
    );
  } catch {
    return null;
  }
}

export async function getIFLiveries(): Promise<LiveriesResponse> {
  try {
    const IF_LIVERIES_CACHE_TTL_MS = 43_200_000;
    const now = Date.now();
    if (
      typeof ifLiveriesCache !== 'undefined' &&
      ifLiveriesCache &&
      now - ifLiveriesCache.timestamp < IF_LIVERIES_CACHE_TTL_MS
    ) {
      return ifLiveriesCache.data;
    }

    const airlineData = await db.select().from(airline).get();

    if (!airlineData?.infiniteFlightApiKey) {
      throw new Error('Infinite Flight API key not configured');
    }

    const apiKey = decrypt(airlineData.infiniteFlightApiKey);
    const API_URL = `https://api.infiniteflight.com/public/v2/aircraft/liveries?apikey=${apiKey}`;

    const res = await fetch(API_URL, {
      cache: 'force-cache',
      // In Next runtime this sets ISR TTL, this is ignored elsewhere (e.g. bot)
      next: { revalidate: 43_200 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch Infinite Flight data (${res.status})`);
    }

    type LiveryItem = {
      id: string;
      aircraftID: string;
      aircraftName: string;
      liveryName: string;
    };

    type ApiResponse = {
      errorCode: number;
      result: LiveryItem[];
    };

    const data: ApiResponse = await res.json();

    if (data.errorCode !== 0) {
      throw new Error(`Infinite Flight API returned error: ${data.errorCode}`);
    }

    const aircraftMap = new Map<
      string,
      { aircraftID: string; liveries: Array<{ id: string; name: string }> }
    >();

    for (const livery of data.result) {
      if (!aircraftMap.has(livery.aircraftName)) {
        aircraftMap.set(livery.aircraftName, {
          aircraftID: livery.aircraftID,
          liveries: [],
        });
      }
      aircraftMap.get(livery.aircraftName)!.liveries.push({
        id: livery.id,
        name: livery.liveryName,
      });
    }

    const aircraft = [...aircraftMap.entries()].map(
      ([name, { aircraftID, liveries }]) => ({
        name,
        aircraftID,
        liveries,
      })
    );
    const response: LiveriesResponse = { aircraft };
    ifLiveriesCache = { data: response, timestamp: now };
    return response;
  } catch {
    throw new Error('Failed to fetch Infinite Flight data');
  }
}

export interface IFSessionInfo {
  maxUsers: number;
  id: string;
  name: string;
  userCount: number;
  type: number;
  worldType: number; // 0 Solo, 1 Casual, 2 Training, 3 Expert, 4 Private
  minimumGradeLevel: number;
  minimumAppVersion: string | null;
  maximumAppVersion: string | null;
}

let ifLiveriesCache: { data: LiveriesResponse; timestamp: number } | null =
  null;

const IF_SESSION_CACHE_TTL_MS = 30 * 60 * 1000;
let ifSessionCache: {
  session: IFSessionInfo | null;
  timestamp: number;
} | null = null;

export async function getIFSession(): Promise<IFSessionInfo | null> {
  if (
    ifSessionCache &&
    Date.now() - ifSessionCache.timestamp < IF_SESSION_CACHE_TTL_MS
  ) {
    return ifSessionCache.session;
  }

  const airlineData = await db.select().from(airline).get();
  if (!airlineData?.infiniteFlightApiKey) {
    throw new Error('Infinite Flight API key not configured');
  }
  const apiKey = decrypt(airlineData.infiniteFlightApiKey);
  const url = `https://api.infiniteflight.com/public/v2/sessions?apikey=${apiKey}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch IF sessions (${res.status})`);
  }
  type SessionsResponse = { errorCode: number; result: IFSessionInfo[] };
  const data: SessionsResponse = await res.json();
  if (data.errorCode !== 0) {
    throw new Error(`Infinite Flight API returned error: ${data.errorCode}`);
  }
  const session = data.result.find((s) => s.worldType === 3) ?? null;
  ifSessionCache = { session, timestamp: Date.now() };
  return session;
}
