import { getAllInactiveUsers } from '@/db/queries/inactivity';
import { sendInactivityWebhook } from '@/lib/webhooks/inactivity';
import { sendInactivityNotificationEmail } from '@/lib/email-utils';
import { isSetupComplete } from '@/db/queries/airline';
import { logger } from '@/lib/logger';

// Check if current time is between 23:55 and 00:05
function isWithinTimeWindow(): boolean {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // Convert to total minutes since midnight for easier comparison
  const currentMinutes = hours * 60 + minutes;

  // Time window: 23:55 to 00:05 (1435 to 5 minutes)
  // Since it spans midnight, we need to check both sides
  const isAfterElevenFiftyFive = currentMinutes >= 1435; // 23:55
  const isBeforeTwelveZeroFive = currentMinutes <= 5; // 00:05

  return isAfterElevenFiftyFive || isBeforeTwelveZeroFive;
}

logger.info('Running `send-inactivity-notification` script');

if (isWithinTimeWindow()) {
  logger.info(
    'Time is within allowed window (23:55-00:05), proceeding with notifications'
  );
  if (await isSetupComplete()) {
    try {
      const inactiveUsers = await getAllInactiveUsers();
      await sendInactivityWebhook();

      // Send emails to inactive users
      if (inactiveUsers.length > 0) {
        // Get airline data for inactivity period
        const { getAirline } = await import('@/db/queries/airline');
        const airline = await getAirline();
        const inactivityPeriod = airline?.inactivityPeriod || 30;

        logger.info(
          `Sending inactivity notification emails to ${inactiveUsers.length} users`
        );

        for (const user of inactiveUsers) {
          try {
            if (user.email) {
              await sendInactivityNotificationEmail(
                user.email,
                user.name || 'Pilot',
                inactivityPeriod
              );
              logger.info(`Sent inactivity email to ${user.email}`);
            }
          } catch (emailError) {
            logger.error({ error: emailError, userId: user.id });
          }

          // Add a small delay to avoid overwhelming the email service
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        logger.info('Completed sending inactivity notification emails');
      }
    } catch (e) {
      logger.error({ error: e });
    }
  }
} else {
  logger.info(
    'Time is outside allowed window (23:55-00:05), skipping notifications'
  );
}
