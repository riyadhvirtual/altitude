'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { uploadAuthBranding } from '@/domains/airline/upload-auth-image';
import { createRoleActionClient } from '@/lib/safe-action';

const schema = z.object({
  file: z.instanceof(File, { message: 'File required' }),
});

export const uploadAuthBrandingAction = createRoleActionClient(['admin'])
  .inputSchema(schema)
  .action(async ({ parsedInput }) => {
    const { file } = parsedInput;

    const url = await uploadAuthBranding({ file });

    revalidatePath('/admin/settings');
    revalidatePath('/login');
    revalidatePath('/signup');

    return {
      success: true,
      message: 'Auth background updated',
      url,
    };
  });
