'use server';

import { getStatisticsTabsData } from '@/db/queries/statistics';
import type { StatisticsTabsData, TimePeriod } from '@/types/statistics';

export async function getStatisticsData(
  period: TimePeriod,
  customDays?: number
): Promise<StatisticsTabsData> {
  try {
    return await getStatisticsTabsData(period, customDays);
  } catch {
    throw new Error('Failed to load statistics data');
  }
}
