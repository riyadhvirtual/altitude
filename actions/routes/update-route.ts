'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { updateRoute } from '@/domains/routes/update-route';
import { handleDbError } from '@/lib/db-error';
import { createRoleActionClient } from '@/lib/safe-action';

const schema = z.object({
  id: z.string(),
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
  aircraftIds: z.array(z.string()),
  flightNumbers: z.array(z.string()),
});

export const updateRouteAction = createRoleActionClient(['routes'])
  .inputSchema(schema)
  .action(async ({ parsedInput }) => {
    try {
      await updateRoute(parsedInput);

      revalidatePath(`/admin/routes/${parsedInput.id}`);
      revalidatePath('/admin/routes');

      return { success: true } as const;
    } catch (error) {
      handleDbError(error, {
        fallback: 'Failed to update route',
      });
    }
  });
