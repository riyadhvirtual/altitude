import { after } from 'next/server';

import { checkAndProcessRankup } from '@/lib/rankup';

export function maybeScheduleRankup(
  userId: string,
  oldFlightTime: number,
  newFlightTime: number
) {
  if (oldFlightTime === newFlightTime) {
    return;
  }
  after(() => checkAndProcessRankup(userId, oldFlightTime, newFlightTime));
}
