'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { importRoutesFromCsv } from '@/domains/routes/import-routes';
import { handleDbError } from '@/lib/db-error';
import { createRoleActionClient } from '@/lib/safe-action';

const importRoutesSchema = z.object({
  file: z.instanceof(File, { message: 'CSV file required' }),
});

export const importRoutesAction = createRoleActionClient(['routes'])
  .inputSchema(importRoutesSchema)
  .action(async ({ parsedInput }) => {
    try {
      const { created, skipped } = await importRoutesFromCsv(parsedInput.file);
      revalidatePath('/admin/routes');
      return {
        success: true,
        message: `${created} created, ${skipped} skipped as duplicates`,
      } as const;
    } catch (error) {
      handleDbError(error, { fallback: 'Failed to import routes' });
    }
  });
