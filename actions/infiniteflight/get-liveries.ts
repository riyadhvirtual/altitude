'use server';

import { getIFLiveries } from '@/lib/if-api';
import { actionClient } from '@/lib/safe-action';
import type { LiveriesResponse } from '@/types/shared';

export const getLiveriesAction = actionClient.action(async () => {
  const data: LiveriesResponse = await getIFLiveries();
  return data;
});
