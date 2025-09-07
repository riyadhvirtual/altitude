'use server';

import { z } from 'zod';

import { filterRoutesAdvanced } from '@/db/queries';
import { handleDbError } from '@/lib/db-error';
import { authActionClient } from '@/lib/safe-action';

const filterConditionSchema = z
  .object({
    id: z.string(),
    field: z.enum([
      'flightNumber',
      'departureIcao',
      'arrivalIcao',
      'aircraftId',
      'flightTime',
      'airline',
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
    ]),
    value: z.union([z.string(), z.number()]).optional(),
  })
  .refine(
    (f) =>
      f.field === 'airline' ? ['is', 'is_not'].includes(f.operator) : true,
    {
      path: ['operator'],
      message: 'Only is/is_not allowed for airline',
    }
  );

const inputSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1).default(10),
  filters: z.array(filterConditionSchema),
});

export const fetchRoutesAction = authActionClient
  .inputSchema(inputSchema)
  .action(async ({ parsedInput }) => {
    const { page, limit, filters } = parsedInput;
    try {
      const { routes, total } = await filterRoutesAdvanced(
        filters,
        page,
        limit
      );
      return { success: true, routes, total };
    } catch (error) {
      handleDbError(error, {
        fallback: 'Failed to fetch routes',
      });
    }
  });
