import { logger } from '@/lib/logger';

logger.info(`❤️  Heartbeat at ${new Date().toISOString()}`);

const WEBHOOK_URL =
  'https://discord.com/api/webhooks/1404799360998314044/BXtAbfnLOIC7qO_j3mOQbvhkKK11InGD4bYhy8ulRowmUQaQlHjbC-DXPlujJ-A0uhyD';

async function sendHeartbeat() {
  try {
    const payload = {
      username: 'Server Heartbeat',
      embeds: [
        {
          title: '💓 Heartbeat',
          description: `The service is alive — ${new Date().toISOString()}`,
          color: 0x2ecc71,
        },
      ],
    };

    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      logger.error(`Heartbeat failed: ${res.status} ${res.statusText}`);
    } else {
      logger.info('✅ Heartbeat webhook sent');
    }
  } catch (err) {
    logger.error({ error: err }, '❌ Heartbeat error:');
  }
}

sendHeartbeat();
