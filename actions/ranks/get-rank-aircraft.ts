'use server';

import { z } from 'zod';

import { getRankAircraft } from '@/domains/ranks/get-rank-aircraft';
import { authActionClient } from '@/lib/safe-action';

const getRankAircraftSchema = z.object({
  rankId: z.string(),
});

export const getRankAircraftAction = authActionClient
  .inputSchema(getRankAircraftSchema)
  .action(async ({ parsedInput: { rankId } }) => {
    try {
      const result = await getRankAircraft(rankId);
      return { success: true, ...result };
    } catch {
      return { success: false, error: 'Failed to fetch rank aircraft' };
    }
  });
