'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { editMultiplier } from '@/domains/multipliers/edit-multiplier';
import { extractDbErrorMessage } from '@/lib/db-error';
import { createRoleActionClient } from '@/lib/safe-action';

const editMultiplierSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(1, 'Multiplier name is required')
    .max(100, 'Multiplier name must be less than 100 characters'),
  value: z.coerce.number().min(1.1, 'Multiplier value must be greater than 1'),
});

export const editMultiplierAction = createRoleActionClient(['multipliers'])
  .inputSchema(editMultiplierSchema)
  .action(async ({ parsedInput: { id, name, value } }) => {
    try {
      await editMultiplier(id, name, value);

      revalidatePath('/admin/multipliers');

      return {
        success: true,
        message: 'Multiplier updated successfully',
      } as const;
    } catch (error) {
      const errorMessage = extractDbErrorMessage(error, {
        unique: {
          name: 'A multiplier with this name already exists',
          value: 'A multiplier with this value already exists',
        },
        fallback: 'Failed to update multiplier',
      });

      return {
        success: false,
        error: errorMessage,
      };
    }
  });
