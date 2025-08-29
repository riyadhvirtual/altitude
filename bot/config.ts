export interface BotConfig {
  token: string;
  clientId: string;
  guildId?: string;
  prefix: string;
}

export const DEFAULT_CONFIG: Partial<BotConfig> = {
  prefix: '!',
};

export const COMMAND_DATA_FUNCTIONS = [
  'getPirepCommandData',
  'getAcarsCommandData',
  'getLeaderboardCommandData',
  'getStatsCommandData',
  'getLiveCommandData',
] as const;

export const BOT_INTENTS = ['Guilds', 'GuildMessages'] as const;
