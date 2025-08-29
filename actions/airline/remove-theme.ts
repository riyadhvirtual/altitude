'use server';

import { z } from 'zod';

import { removeTheme } from '@/domains/airline/remove-theme';
import { createRoleActionClient } from '@/lib/safe-action';

const schema = z.object({
  url: z
    .string()
    .trim()
    .refine((v) => /^\/(themes\/).+\.css$/i.test(v), 'Invalid theme URL'),
});

export const removeThemeAction = createRoleActionClient(['admin'])
  .inputSchema(schema)
  .action(async ({ parsedInput }) => {
    const { url } = parsedInput;
    await removeTheme({ url });
    return { success: true, message: 'Theme removed', url };
  });
