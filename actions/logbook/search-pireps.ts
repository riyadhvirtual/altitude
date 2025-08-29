'use server';

import { z } from 'zod';

import {
  getUserPireps,
  getUserPirepsFiltered,
  type PirepFilterCondition,
} from '@/db/queries/pireps';
import { authCheck } from '@/lib/auth-check';
import { authActionClient } from '@/lib/safe-action';

const fetchUserPirepsSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  filters: z
    .array(
      z.object({
        id: z.string(),
        field: z.enum([
          'flightNumber',
          'departureIcao',
          'arrivalIcao',
          'aircraftId',
          'flightTime',
          'cargo',
          'fuelBurned',
          'status',
          'date',
        ]),
        operator: z.enum([
          'contains',
          'is',
          'is_not',
          'starts_with',
          'ends_with',
          'greater_than',
          'less_than',
          'greater_equal',
          'less_equal',
          'before',
          'after',
        ]),
        value: z.union([z.string(), z.number()]).optional(),
      })
    )
    .default([]),
});

export const fetchUserPirepsAction = authActionClient
  .inputSchema(fetchUserPirepsSchema)
  .action(async ({ parsedInput: { page, limit, filters } }) => {
    const session = await authCheck();

    const hasAnyFilter = filters.length > 0;

    const result = hasAnyFilter
      ? await getUserPirepsFiltered(
          session.user.id,
          filters as PirepFilterCondition[],
          page,
          limit
        )
      : await getUserPireps(session.user.id, page, limit);

    return result;
  });
