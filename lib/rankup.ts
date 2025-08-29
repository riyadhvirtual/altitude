import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { getUserRank } from '@/db/queries/ranks';
import { airline, users } from '@/db/schema';
import { type RankupData, sendRankupWebhook } from '@/lib/webhooks/rankup';

/**
 * Check if a user has achieved a new rank after a flight and handle the rankup process
 */
export async function checkAndProcessRankup(
  userId: string,
  previousFlightTime: number,
  newFlightTime: number
): Promise<{
  rankupOccurred: boolean;
  newRank?: string;
  previousRank?: string;
}> {
  try {
    // Get what rank the user should have had before the flight
    const previousRankBasedOnFlightTime = await getUserRank(previousFlightTime);

    // Get what rank the user should have after the flight
    const newRankBasedOnFlightTime = await getUserRank(newFlightTime);

    // If no new rank qualifies, no rankup
    if (!newRankBasedOnFlightTime) {
      return { rankupOccurred: false };
    }

    // Compare the ranks, if they're different, we have a rankup
    const previousRankMinFlightTime =
      previousRankBasedOnFlightTime?.minimumFlightTime ?? 0;
    const newRankMinFlightTime = newRankBasedOnFlightTime.minimumFlightTime;

    const hasNewRank = newRankMinFlightTime > previousRankMinFlightTime;

    if (!hasNewRank) {
      return { rankupOccurred: false };
    }

    // Send webhook notification with the correct previous rank
    await sendRankupWebhookNotification(
      userId,
      previousRankBasedOnFlightTime?.name || null,
      newRankBasedOnFlightTime.name,
      newFlightTime
    );

    return {
      rankupOccurred: true,
      newRank: newRankBasedOnFlightTime.name,
      previousRank: previousRankBasedOnFlightTime?.name || undefined,
    };
  } catch {
    return { rankupOccurred: false };
  }
}

/**
 * Send rankup webhook notification
 */
async function sendRankupWebhookNotification(
  userId: string,
  previousRank: string | null,
  newRank: string,
  totalFlightTime: number
): Promise<void> {
  try {
    const [userData, airlineData] = await Promise.all([
      db
        .select({
          name: users.name,
          callsign: users.callsign,
        })
        .from(users)
        .where(eq(users.id, userId))
        .get(),
      db
        .select({
          name: airline.name,
          callsign: airline.callsign,
          rankUpWebhookUrl: airline.rankUpWebhookUrl,
        })
        .from(airline)
        .limit(1)
        .get(),
    ]);

    if (!airlineData?.rankUpWebhookUrl || !userData) {
      return;
    }

    const webhookPayload: RankupData = {
      userId,
      pilotName: userData.name,
      pilotCallsign: userData.callsign!.toString(),
      previousRank,
      newRank,
      totalFlightTime,
      achievedAt: new Date(),
    };

    await sendRankupWebhook(airlineData.rankUpWebhookUrl, webhookPayload, {
      airlineName: airlineData.name,
      airlineCallsign: airlineData.callsign,
    });
  } catch {
    // Silently fail, webhook is not critical
  }
}
