'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createRoute } from '@/domains/routes/create-route';
import { handleDbError } from '@/lib/db-error';
import { createRoleActionClient } from '@/lib/safe-action';

const createRouteSchema = z.object({
  departureIcao: z
    .string()
    .length(4)
    .regex(/^[A-Z]+$/),
  arrivalIcao: z
    .string()
    .length(4)
    .regex(/^[A-Z]+$/),
  flightTime: z.number().int().positive(),
  details: z.string().optional(),
  aircraftIds: z.array(z.string().min(1)).default([]),
  flightNumbers: z.array(z.string().min(1)).default([]),
});

export const createRouteAction = createRoleActionClient(['routes'])
  .inputSchema(createRouteSchema)
  .action(async ({ parsedInput }) => {
    try {
      await createRoute(parsedInput);

      revalidatePath('/admin/routes');

      return { success: true } as const;
    } catch (error) {
      handleDbError(error, {
        fallback: 'Failed to create route',
      });
    }
  });
