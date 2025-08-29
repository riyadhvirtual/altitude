'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createMultiplier } from '@/domains/multipliers/create-multiplier';
import { extractDbErrorMessage } from '@/lib/db-error';
import { createRoleActionClient } from '@/lib/safe-action';

const createMultiplierSchema = z.object({
  name: z
    .string()
    .min(1, 'Multiplier name is required')
    .max(100, 'Multiplier name must be less than 100 characters'),
  value: z.coerce.number().min(1.1, 'Multiplier value must be greater than 1'),
});

export const createMultiplierAction = createRoleActionClient(['multipliers'])
  .inputSchema(createMultiplierSchema)
  .action(async ({ parsedInput: { name, value } }) => {
    try {
      const newMultiplier = await createMultiplier(name, value);

      revalidatePath('/admin/multipliers');

      return {
        success: true,
        message: 'Multiplier created successfully',
        multiplier: newMultiplier,
      };
    } catch (error) {
      const errorMessage = extractDbErrorMessage(error, {
        unique: {
          name: 'A multiplier with this name already exists',
          value: 'A multiplier with this value already exists',
        },
        fallback: 'Failed to create multiplier',
      });

      return {
        success: false,
        error: errorMessage,
      };
    }
  });
