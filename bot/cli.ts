import { BotManager } from './manager';

const command = process.argv[2];

async function main() {
  const botManager = BotManager.getInstance();

  switch (command) {
    case 'start': {
      const started = await botManager.start();
      process.exit(started ? 0 : 1);
      break;
    }

    case 'stop': {
      await botManager.stop();
      process.exit(0);
      break;
    }

    case 'restart': {
      const restarted = await botManager.restart();
      process.exit(restarted ? 0 : 1);
      break;
    }

    case 'status': {
      const status = await botManager.getStatus();
      if (status.running) {
        process.exit(0);
      } else {
        process.exit(1);
      }
      break;
    }

    default: {
      process.exit(1);
    }
  }
}

main().catch(() => {
  process.exit(1);
});
