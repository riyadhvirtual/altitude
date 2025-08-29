import { formatFullCallsign, formatHoursMinutes } from '@/lib/utils';
import {
  createDiscordEmbed,
  type DiscordWebhookPayload,
  sendDiscordWebhook,
} from '@/lib/webhooks/index';
import type { RankupData, WebhookOptions } from '@/types/webhooks';

export type { RankupData };

export async function sendRankupWebhook(
  webhookUrl: string,
  rankupData: RankupData,
  options: WebhookOptions
): Promise<void> {
  const { airlineName, airlineCallsign } = options;
  const fullCallsign = formatFullCallsign(
    airlineCallsign,
    rankupData.pilotCallsign
  );
  const ts = Math.floor(rankupData.achievedAt.getTime() / 1000);

  const mainMessage = `🎉 **${rankupData.pilotName}** (\`${fullCallsign}\`) has achieved the rank of **${rankupData.newRank}**!`;

  const lines = [mainMessage];

  if (rankupData.previousRank) {
    lines.push(`Previously held: ${rankupData.previousRank}`);
  }

  lines.push(
    `Total Flight Time: ${formatHoursMinutes(rankupData.totalFlightTime)}`,
    `Congratulations on this achievement! <t:${ts}:R>`
  );

  const embed = createDiscordEmbed({
    title: '🎖️ Rank Promotion!',
    description: lines.join('\n\n'),
    color: 0x27ae60,
    footer: { text: airlineName },
    timestamp: rankupData.achievedAt.toISOString(),
  });

  const payload: DiscordWebhookPayload = {
    embeds: [embed],
  };

  await sendDiscordWebhook({ url: webhookUrl, payload });
}
