import { db } from '@/db';
import { getAllInactiveUsers } from '@/db/queries/inactivity';
import { airline } from '@/db/schema';
import { formatFullCallsign } from '@/lib/utils';
import {
  createDiscordEmbed,
  type DiscordWebhookPayload,
  sendDiscordWebhook,
} from '@/lib/webhooks/index';

export async function sendInactivityWebhook() {
  try {
    const airlineData = await db
      .select({ inactivityWebhookUrl: airline.inactivityWebhookUrl })
      .from(airline)
      .limit(1);
    const webhookUrl = airlineData[0]?.inactivityWebhookUrl;

    if (!webhookUrl) {
      return;
    }

    const inactiveUsers = await getAllInactiveUsers();

    // just skipping the webhook
    if (inactiveUsers.length === 0) {
      return;
    }

    const airlineInfo = await db
      .select({
        name: airline.name,
        callsign: airline.callsign,
        inactivityPeriod: airline.inactivityPeriod,
      })
      .from(airline)
      .limit(1);
    const airlineName = airlineInfo[0]?.name || 'Airline';
    const airlineCallsign = airlineInfo[0]?.callsign || '';
    const inactivityPeriod = airlineInfo[0]?.inactivityPeriod || 30;

    const baseUrl = process.env.BETTER_AUTH_URL;

    const userLines = inactiveUsers.map((user, index) => {
      const lastFlightDate = user.lastFlight
        ? new Date(user.lastFlight * 1000).toISOString().split('T')[0]
        : 'Never';
      const fullCallsign = formatFullCallsign(
        airlineCallsign,
        user.callsign || ''
      );
      const userUrl = `${baseUrl}/admin/users/${user.id}`;
      const sanitizedName = user.name?.replace(/[*_`~]/g, '') || 'Unknown';
      const sanitizedCallsign = fullCallsign.replace(/[*_`~]/g, '');

      return `${index + 1}. **[${sanitizedName}](${userUrl})** (\`${sanitizedCallsign}\`) - Last flight: ${lastFlightDate}`;
    });

    // Split into multiple messages if too many users
    const maxUsersPerMessage = 15; // Conservative limit
    const userChunks = [];
    for (let i = 0; i < userLines.length; i += maxUsersPerMessage) {
      userChunks.push(userLines.slice(i, i + maxUsersPerMessage));
    }

    for (let i = 0; i < userChunks.length; i++) {
      const chunk = userChunks[i];
      const isFirstChunk = i === 0;
      const isLastChunk = i === userChunks.length - 1;

      let description = '';
      if (isFirstChunk) {
        description = `Found **${inactiveUsers.length} inactive users** who haven't flown in the last ${inactivityPeriod} days:\n\n`;
      } else {
        description = `**Continued...**\n\n`;
      }

      const userLinesText = chunk.join('\n');

      // Discord embed description limit is 4096 characters
      const maxDescriptionLength = 4096;
      const availableLength = maxDescriptionLength - description.length;

      let finalUserLines = userLinesText;
      if (userLinesText.length > availableLength) {
        // Truncate and add indicator
        finalUserLines =
          userLinesText.substring(0, availableLength - 50) +
          '\n\n... and more users';
      }

      description += finalUserLines;

      if (!isLastChunk) {
        description += '\n\n*Continued in next message...*';
      }

      const embed = createDiscordEmbed({
        title: isFirstChunk
          ? '⏰ Inactivity Alert'
          : '⏰ Inactivity Alert (Continued)',
        description,
        color: 0xe74c3c, // Red
        footer: { text: `${airlineName} - Page ${i + 1}/${userChunks.length}` },
        timestamp: new Date().toISOString(),
      });

      const payload: DiscordWebhookPayload = {
        embeds: [embed],
      };

      try {
        await sendDiscordWebhook({ url: webhookUrl, payload });

        if (!isLastChunk) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch {
        // Swallow error to continue with next chunk
      }
    }
  } catch {
    // Swallow error to avoid console output
  }
}
