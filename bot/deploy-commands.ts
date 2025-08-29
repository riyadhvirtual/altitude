import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';

import {
  getDecryptedBotToken,
  getDiscordClientId,
} from '@/domains/airline/update-bot-settings';
import { logger } from '@/lib/logger';

import { COMMAND_DATA_FUNCTIONS } from './config';

async function getCredentials(): Promise<{
  token: string | null;
  clientId: string | null;
}> {
  try {
    const [token, clientId] = await Promise.all([
      getDecryptedBotToken(),
      getDiscordClientId(),
    ]);

    return { token, clientId };
  } catch (error) {
    logger.error(error, 'Failed to get credentials');
    return { token: null, clientId: null };
  }
}

function getCommandFiles(commandsPath: string): string[] {
  try {
    return readdirSync(commandsPath).filter((file) => file.endsWith('.ts'));
  } catch (error) {
    logger.error(error, 'Failed to read commands directory');
    return [];
  }
}

async function getDynamicCommandData(
  command: Record<string, unknown>
): Promise<{ name: string; toJSON: () => unknown } | null> {
  for (const funcName of COMMAND_DATA_FUNCTIONS) {
    if (funcName in command) {
      try {
        const func = command[funcName] as () => Promise<{
          name: string;
          toJSON: () => unknown;
        }>;
        return await func();
      } catch (error) {
        logger.error(
          error,
          `Failed to execute dynamic data function: ${funcName}`
        );
      }
    }
  }
  return null;
}

async function loadCommand(
  file: string,
  commandsPath: string
): Promise<unknown | null> {
  const filePath = join(commandsPath, file);

  try {
    const command = await import(filePath);

    if (!('execute' in command)) {
      logger.warn(`Command file ${file} missing execute function`);
      return null;
    }

    const dynamicData = await getDynamicCommandData(command);

    if (dynamicData) {
      logger.debug(`Loaded dynamic command: ${dynamicData.name}`);
      return dynamicData.toJSON();
    } else if ('data' in command) {
      logger.debug(`Loaded static command: ${command.data.name}`);
      return command.data.toJSON();
    } else {
      logger.warn(`Command file ${file} has no valid data`);
      return null;
    }
  } catch (error) {
    logger.error(error, `Failed to load command from file: ${file}`);
    return null;
  }
}

async function loadCommands(): Promise<unknown[]> {
  try {
    const commands: unknown[] = [];
    const commandsPath = join(__dirname, 'commands');
    const commandFiles = getCommandFiles(commandsPath);

    for (const file of commandFiles) {
      const commandData = await loadCommand(file, commandsPath);
      if (commandData) {
        commands.push(commandData);
      }
    }

    logger.info(`Loaded ${commands.length} commands`);
    return commands;
  } catch (error) {
    logger.error(error, 'Failed to load commands');
    throw error;
  }
}

async function registerCommands(
  token: string,
  clientId: string,
  commands: unknown[]
): Promise<void> {
  try {
    const rest = new REST().setToken(token);

    await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });

    logger.info('Successfully registered commands with Discord');
  } catch (error) {
    logger.error(error, 'Failed to register commands with Discord');
    throw error;
  }
}

async function deployCommands(): Promise<void> {
  try {
    const { token, clientId } = await getCredentials();

    if (!token || !clientId) {
      logger.error('Failed to get bot credentials');
      process.exit(1);
    }

    const commands = await loadCommands();
    await registerCommands(token, clientId, commands);

    logger.info(`Successfully deployed ${commands.length} commands`);
  } catch (error) {
    logger.error(error, 'Failed to deploy commands');
    process.exit(1);
  }
}

deployCommands().catch((error) => {
  process.stderr.write(`Failed to deploy commands: ${error}\n`);
  process.exit(1);
});
