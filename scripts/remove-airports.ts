import { db } from '@/db';
import { airports } from '@/db/schema';
import { logger } from '@/lib/logger';

async function cleanAirports() {
  await db.delete(airports);
  logger.info('All airports have been deleted.');
}

cleanAirports().catch((err) => {
  logger.error({ error: err });
  process.exit(1);
});
