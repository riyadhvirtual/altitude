import { exec as cpExec, spawn } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';
import { promisify } from 'util';

import { logger } from '@/lib/logger';

// Use local .tmp directory in development, /tmp in production
const isProduction = process.env.NODE_ENV === 'production';
// use PM2 in tenant mode
const isPM2 = process.env.PROCESS_MANAGER === 'pm2';

const tempDir = isProduction ? '/tmp' : join(process.cwd(), '.tmp');
const BOT_PID_FILE = join(tempDir, 'discord-bot.pid');
const execAsync = promisify(cpExec);

export class BotManager {
  private static instance: BotManager;

  static getInstance(): BotManager {
    if (!BotManager.instance) {
      BotManager.instance = new BotManager();
    }
    return BotManager.instance;
  }

  private async ensureTempDir(): Promise<void> {
    try {
      await fs.mkdir(tempDir, { recursive: true });
    } catch {
      // Directory might already exist, ignore error
    }
  }

  async isRunning(): Promise<boolean> {
    if (isPM2) {
      try {
        const { stdout } = await execAsync('pm2 pid bot');
        // TODO: Output is always zero, node bug?
        logger.debug('PM2 Is running output: ' + stdout);
        const pm2Pid = parseInt(stdout.trim(), 10);
        return pm2Pid > 0;
      } catch {
        return false;
      }
    }

    try {
      await this.ensureTempDir();
      const pidStr = await fs.readFile(BOT_PID_FILE, 'utf-8');
      const pid = parseInt(pidStr.trim());

      process.kill(pid, 0);
      return true;
    } catch {
      return false;
    }
  }

  async stop(): Promise<void> {
    if (isPM2) {
      try {
        await execAsync('pm2 stop bot');
      } catch (error) {
        logger.error({ error }, 'Failed to stop bot via PM2');
      }
      return;
    }

    try {
      const pidStr = await fs.readFile(BOT_PID_FILE, 'utf-8');
      const pid = parseInt(pidStr.trim());

      process.kill(pid, 'SIGTERM');

      let attempts = 0;
      while (attempts < 10) {
        try {
          process.kill(pid, 0);
          await new Promise((resolve) => setTimeout(resolve, 500));
          attempts++;
        } catch {
          break;
        }
      }

      if (attempts >= 10) {
        process.kill(pid, 'SIGKILL');
      }

      await fs.unlink(BOT_PID_FILE).catch(() => {});
    } catch {
      await fs.unlink(BOT_PID_FILE).catch(() => {});
    }
  }

  async deployCommands(): Promise<boolean> {
    await this.ensureTempDir();

    return new Promise((resolve) => {
      const deployProcess = spawn('bun', ['run', 'bot:deploy'], {
        cwd: process.cwd(),
        stdio: 'pipe',
        detached: false,
        env: { ...process.env }, // Inherit all environment variables
      });

      deployProcess.stdout?.on('data', (data) => {
        logger.info(`[DEPLOY] ${data.toString().trim()}`);
      });

      deployProcess.stderr?.on('data', (data) => {
        logger.error(data.toString().trim());
      });

      deployProcess.on('close', (code) => {
        if (code === 0) {
          resolve(true);
        } else {
          resolve(false);
        }
      });

      deployProcess.on('error', () => {
        resolve(false);
      });
    });
  }

  async start(): Promise<boolean> {
    try {
      if (await this.isRunning()) {
        await this.stop();
      }

      const deploySuccess = await this.deployCommands();
      if (!deploySuccess) {
        return false;
      }

      if (isPM2) {
        try {
          const { stdout } = await execAsync('pm2 pid bot');
          const pm2Pid = parseInt(stdout.trim(), 10);
          if (pm2Pid > 0) {
            await execAsync('pm2 restart bot');
          } else {
            await execAsync('pm2 start bot');
          }
          return true;
        } catch (error) {
          logger.error({ error }, 'Failed to start/restart bot via PM2');
          return false;
        }
      }

      const botProcess = spawn('bun', ['run', 'bot'], {
        cwd: process.cwd(),
        stdio: 'pipe',
        detached: true,
        env: { ...process.env },
      });

      if (!botProcess.pid) {
        return false;
      }

      await fs.writeFile(BOT_PID_FILE, botProcess.pid.toString());

      botProcess.stdout?.on('data', (data) => {
        logger.info(`[BOT] ${data.toString().trim()}`);
      });

      botProcess.stderr?.on('data', (data) => {
        logger.error(data.toString().trim());
      });

      botProcess.on('close', (_code) => {
        fs.unlink(BOT_PID_FILE).catch(() => {});
      });

      botProcess.on('error', () => {
        fs.unlink(BOT_PID_FILE).catch(() => {});
      });

      botProcess.unref();

      await new Promise((resolve) => setTimeout(resolve, 2000));

      return await this.isRunning();
    } catch {
      return false;
    }
  }

  async restart(): Promise<boolean> {
    await this.stop();
    return await this.start();
  }

  async getStatus(): Promise<{ running: boolean; pid?: number }> {
    if (isPM2) {
      try {
        const { stdout } = await execAsync('pm2 pid bot');
        const pm2Pid = parseInt(stdout.trim(), 10);
        if (pm2Pid > 0) {
          return { running: true, pid: pm2Pid };
        }
        return { running: false };
      } catch {
        return { running: false };
      }
    }

    if (await this.isRunning()) {
      try {
        const pidStr = await fs.readFile(BOT_PID_FILE, 'utf-8');
        const pid = parseInt(pidStr.trim());
        return { running: true, pid };
      } catch {
        return { running: false };
      }
    }
    return { running: false };
  }
}
