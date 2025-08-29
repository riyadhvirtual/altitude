import { importAirportsIfNeeded } from '@/domains/setup/import-airports';
import { logger } from '@/lib/logger';

try {
  await importAirportsIfNeeded();
  logger.info('Airports checked/seeded!');
} catch (error) {
  logger.error({ error });
}
