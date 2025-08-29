'use server';

import { listCustomThemes } from '@/domains/airline/themes';
import { createRoleActionClient } from '@/lib/safe-action';

export const getThemesAction = createRoleActionClient(['admin']).action(
  async () => {
    const custom = await listCustomThemes();
    return {
      success: true,
      themes: custom,
    };
  }
);
