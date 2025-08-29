import type { ChatInputCommandInteraction } from 'discord.js';
import { MessageFlags, SlashCommandBuilder } from 'discord.js';

import {
  getLeaderboardByFlightTime,
  getLeaderboardByPireps,
} from '@/db/queries';
import { getAirline } from '@/db/queries/airline';
import { formatHoursMinutes } from '@/lib/utils';
import { createDiscordEmbed } from '@/lib/webhooks';

function getDateRanges() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return {
    allTime: new Date(0),
    thirtyDays: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    sevenDays: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
  };
}

function getRankEmoji(rank: number): string {
  switch (rank) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return `${rank}.`;
  }
}

export const data = new SlashCommandBuilder()
  .setName('leaderboard')
  .setDescription('Display top pilots leaderboard')
  .addStringOption((option) =>
    option
      .setName('type')
      .setDescription('Leaderboard type')
      .setRequired(false)
      .addChoices(
        { name: 'Flight Time', value: 'flightTime' },
        { name: 'PIREPs', value: 'pireps' }
      )
  )
  .addStringOption((option) =>
    option
      .setName('period')
      .setDescription('Time period')
      .setRequired(false)
      .addChoices(
        { name: 'All Time', value: 'all' },
        { name: 'Last 30 Days', value: '30' },
        { name: 'Last 7 Days', value: '7' }
      )
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    const type = interaction.options.getString('type') || 'flightTime';
    const period = interaction.options.getString('period') || 'all';

    const { allTime, thirtyDays, sevenDays } = getDateRanges();

    let fromDate: Date;
    switch (period) {
      case '30':
        fromDate = thirtyDays;
        break;
      case '7':
        fromDate = sevenDays;
        break;
      default:
        fromDate = allTime;
    }

    const airlineData = await getAirline();
    const airlineName = airlineData?.name;

    let leaderboardData;
    let title;
    let description;

    if (type === 'flightTime') {
      leaderboardData = await getLeaderboardByFlightTime(fromDate);
      title = '⏱️ Flight Time Leaderboard';
      description = 'Top pilots ranked by total flight time';
    } else {
      leaderboardData = await getLeaderboardByPireps(fromDate);
      title = '📋 PIREPs Leaderboard';
      description = 'Top pilots ranked by total approved PIREPs';
    }

    const periodText =
      period === 'all'
        ? 'All Time'
        : period === '30'
          ? 'Last 30 Days'
          : 'Last 7 Days';

    if (leaderboardData.length === 0) {
      const embed = createDiscordEmbed({
        title,
        description: `No pilots found for ${periodText.toLowerCase()}`,
        color: 0x95a5a6,
        footer: { text: airlineName! },
        timestamp: new Date().toISOString(),
      });

      await interaction.reply({ embeds: [embed] });
      return;
    }

    const top10 = leaderboardData.slice(0, 10);

    const lines = top10.map((pilot, index) => {
      const rank = index + 1;
      const rankEmoji = getRankEmoji(rank);

      if (type === 'flightTime') {
        const flightTime = formatHoursMinutes(pilot.totalFlightTime);
        const flightText =
          pilot.totalApprovedFlights === 1 ? 'flight' : 'flights';
        return `${rankEmoji} **${pilot.pilotName}** ${flightTime} • ${pilot.totalApprovedFlights} ${flightText}`;
      } else {
        const pirepText = pilot.totalApprovedFlights === 1 ? 'PIREP' : 'PIREPs';
        return `${rankEmoji} **${pilot.pilotName}** ${pilot.totalApprovedFlights} ${pirepText} • ${formatHoursMinutes(pilot.totalFlightTime)}`;
      }
    });

    const embed = createDiscordEmbed({
      title,
      description: `${description}\n\n${lines.join('\n\n')}\n\n*${periodText} • Top 10 pilots*`,
      color: 0x3498db,
      footer: { text: airlineName! },
      timestamp: new Date().toISOString(),
    });

    await interaction.reply({ embeds: [embed] });
  } catch {
    if (interaction.deferred) {
      await interaction.editReply({
        content: '❌ Failed to fetch leaderboard data.',
      });
    } else if (interaction.replied) {
      await interaction.followUp({
        content: '❌ Failed to fetch leaderboard data.',
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: '❌ Failed to fetch leaderboard data.',
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}
