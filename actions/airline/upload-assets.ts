'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { uploadAssets } from '@/domains/airline/upload-assets';
import { createRoleActionClient } from '@/lib/safe-action';

const schema = z.object({
  logoType: z.enum(['light', 'dark', 'favicon']),
  file: z.instanceof(File, { message: 'File required' }),
});

export const uploadAssetsAction = createRoleActionClient(['admin'])
  .inputSchema(schema)
  .action(async ({ parsedInput }) => {
    const { logoType, file } = parsedInput;

    const urlToStore = await uploadAssets({ logoType, file });

    revalidatePath('/admin/settings');
    revalidatePath('/');

    return {
      success: true,
      message: `${logoType} asset updated`,
      url: urlToStore,
    };
  });
