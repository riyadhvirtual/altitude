import type {
  ButtonInteraction,
  ChatInputCommandInteraction,
  ModalSubmitInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  MessageFlags,
} from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';

import { isSetupComplete } from '@/db/queries/airline';
import { getDecryptedBotToken } from '@/domains/airline/update-bot-settings';
import { logger } from '@/lib/logger';

import { BOT_INTENTS, COMMAND_DATA_FUNCTIONS } from './config';

interface DiscordCommand {
  data?: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  handleButton?: (interaction: ButtonInteraction) => Promise<void>;
  handleModal?: (interaction: ModalSubmitInteraction) => Promise<void>;
}

async function getBotToken(): Promise<string | null> {
  try {
    return await getDecryptedBotToken();
  } catch (error) {
    logger.error({ error }, 'Failed to get decrypted bot token');
    return null;
  }
}

function createClient(): Client {
  return new Client({
    intents: BOT_INTENTS.map((intent) => GatewayIntentBits[intent]),
  });
}

async function getDynamicCommandData(
  command: Record<string, unknown>
): Promise<SlashCommandBuilder | null> {
  for (const funcName of COMMAND_DATA_FUNCTIONS) {
    if (funcName in command && 'execute' in command) {
      try {
        const func = command[funcName] as () => Promise<SlashCommandBuilder>;
        return await func();
      } catch (error) {
        logger.error(
          { error },
          `Failed to execute dynamic data function: ${funcName}`
        );
      }
    }
  }
  return null;
}

function getCommandFiles(commandsPath: string): string[] {
  try {
    return readdirSync(commandsPath).filter((file) => file.endsWith('.ts'));
  } catch (error) {
    logger.error({ error }, 'Failed to read commands directory');
    return [];
  }
}

async function loadCommand(
  file: string,
  commandsPath: string
): Promise<DiscordCommand | null> {
  const filePath = join(commandsPath, file);

  try {
    const command = await import(filePath);
    const dynamicData = await getDynamicCommandData(command);

    if (dynamicData) {
      logger.debug(`Loaded dynamic command: ${dynamicData.name}`);
      return {
        ...command,
        data: dynamicData,
      };
    } else if ('data' in command && 'execute' in command) {
      logger.debug(`Loaded static command: ${command.data.name}`);
      return command;
    } else {
      logger.warn(`Invalid command structure in file: ${file}`);
      return null;
    }
  } catch (error) {
    logger.error({ error }, `Failed to load command from file: ${file}`);
    return null;
  }
}

async function loadCommands(): Promise<Collection<string, DiscordCommand>> {
  try {
    const commands = new Collection<string, DiscordCommand>();
    const commandsPath = join(__dirname, 'commands');
    const commandFiles = getCommandFiles(commandsPath);

    for (const file of commandFiles) {
      const command = await loadCommand(file, commandsPath);
      if (command) {
        commands.set(command.data?.name || file, command);
      }
    }

    logger.info(`Loaded ${commands.size} commands`);
    return commands;
  } catch (error) {
    logger.error({ error }, 'Failed to load commands');
    throw error;
  }
}

function findCommandForButton(
  commands: Collection<string, DiscordCommand>,
  customId: string
): DiscordCommand | null {
  for (const command of commands.values()) {
    if (command.handleButton && command.data?.name) {
      const buttonPrefix = command.data.name;
      if (customId.startsWith(`${buttonPrefix}_`)) {
        logger.debug(`Found command for button: ${buttonPrefix}`);
        return command;
      }
    }
  }
  return null;
}

function findCommandForModal(
  commands: Collection<string, DiscordCommand>
): DiscordCommand | null {
  for (const command of commands.values()) {
    if (command.handleModal) {
      return command;
    }
  }
  return null;
}

async function handleInteractionError(
  interaction:
    | ChatInputCommandInteraction
    | ButtonInteraction
    | ModalSubmitInteraction
): Promise<void> {
  const errorMessage = 'There was an error while executing this command!';

  try {
    if (interaction.deferred) {
      await interaction.editReply({ content: errorMessage });
    } else if (interaction.replied) {
      await interaction.followUp({
        content: errorMessage,
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: errorMessage,
        flags: MessageFlags.Ephemeral,
      });
    }
  } catch (replyError) {
    logger.error({ error: replyError }, 'Failed to send error message to user');
  }
}

async function handleChatInputCommand(
  commands: Collection<string, DiscordCommand>,
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const command = commands.get(interaction.commandName);

  if (!command) {
    logger.warn(`Command not found: ${interaction.commandName}`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    logger.error(
      { error },
      `Error executing command: ${interaction.commandName}`
    );
    await handleInteractionError(interaction);
  }
}

async function handleButtonInteraction(
  commands: Collection<string, DiscordCommand>,
  interaction: ButtonInteraction
): Promise<void> {
  logger.debug(`Button interaction received: ${interaction.customId}`);

  const matchingCommand = findCommandForButton(commands, interaction.customId);

  if (!matchingCommand) {
    logger.warn(`No command found for button: ${interaction.customId}`);
    return;
  }

  try {
    await matchingCommand.handleButton!(interaction);
  } catch (error) {
    logger.error({ error }, `Error handling button: ${interaction.customId}`);
    await handleInteractionError(interaction);
  }
}

async function handleModalInteraction(
  commands: Collection<string, DiscordCommand>,
  interaction: ModalSubmitInteraction
): Promise<void> {
  const matchingCommand = findCommandForModal(commands);

  if (!matchingCommand) {
    logger.warn(`No command found for modal: ${interaction.customId}`);
    return;
  }

  try {
    await matchingCommand.handleModal!(interaction);
  } catch (error) {
    logger.error({ error }, `Error handling modal: ${interaction.customId}`);
    await handleInteractionError(interaction);
  }
}

function setupReadyHandler(client: Client): void {
  client.on(Events.ClientReady, () => {
    logger.info(`Bot is ready! Logged in as ${client.user?.tag}`);
    logger.info(`Serving ${client.guilds.cache.size} guilds`);
  });
}

function setupInteractionHandler(
  client: Client,
  commands: Collection<string, DiscordCommand>
): void {
  client.on(Events.InteractionCreate, async (interaction) => {
    try {
      if (interaction.isChatInputCommand()) {
        await handleChatInputCommand(commands, interaction);
      } else if (interaction.isButton()) {
        await handleButtonInteraction(commands, interaction);
      } else if (interaction.isModalSubmit()) {
        await handleModalInteraction(commands, interaction);
      }
    } catch (error) {
      logger.error({ error }, 'Unhandled interaction error');
      if (
        interaction.isChatInputCommand() ||
        interaction.isButton() ||
        interaction.isModalSubmit()
      ) {
        await handleInteractionError(interaction);
      }
    }
  });
}

async function startBot(): Promise<void> {
  if (!(await isSetupComplete())) {
    logger.warn('Setup not completed yet, exiting bot');
    process.exit(0);
  }
  try {
    const token = await getBotToken();
    if (!token) {
      logger.error('Failed to get bot token');
      process.exit(0); // exit peacefully
    }

    const client = createClient();
    const commands = await loadCommands();

    setupReadyHandler(client);
    setupInteractionHandler(client, commands);

    await client.login(token);
    logger.info('Bot started successfully');
  } catch (error) {
    logger.error({ error }, 'Failed to start bot');
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  process.stderr.write('\n🛑 Received SIGINT, shutting down gracefully...\n');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  process.stderr.write('\n🛑 Received SIGTERM, shutting down gracefully...\n');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  process.stderr.write(
    `Unhandled Rejection at: ${promise} reason: ${reason}\n`
  );
});

process.on('uncaughtException', (error) => {
  process.stderr.write(`Uncaught Exception: ${error}\n`);
  process.exit(1);
});

startBot().catch((error) => {
  process.stderr.write(`Failed to start bot: ${error}\n`);
  process.exit(1);
});
