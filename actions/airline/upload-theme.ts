'use server';

import { z } from 'zod';

import { uploadTheme } from '@/domains/airline/upload-theme';
import { createRoleActionClient } from '@/lib/safe-action';

const schema = z.object({
  file: z.instanceof(File, { message: 'CSS file required' }),
});

export const uploadThemeAction = createRoleActionClient(['admin'])
  .inputSchema(schema)
  .action(async ({ parsedInput }) => {
    const { file } = parsedInput;

    const url = await uploadTheme({ file });

    return {
      success: true,
      message: 'Theme uploaded',
      url,
    };
  });
