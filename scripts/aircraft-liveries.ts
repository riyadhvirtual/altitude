import { logger } from '@/lib/logger';

const API_URL = `https://api.infiniteflight.com/public/v2/aircraft/liveries?apikey=${process.env.IF_API_KEY}`;

type Livery = {
  id: string;
  aircraftID: string;
  aircraftName: string;
  liveryName: string;
};

type ApiResponse = {
  errorCode: number;
  result: Livery[];
};

async function main() {
  const res = await fetch(API_URL);
  if (!res.ok) {
    logger.error(`Failed to fetch: ${res.status} ${res.statusText}`);
    process.exit(1);
  }

  const data: ApiResponse = await res.json();

  if (data.errorCode !== 0) {
    logger.error(`API error: code ${data.errorCode}`);
    process.exit(1);
  }

  const aircraftMap = new Map<
    string,
    { aircraftID: string; liveries: string[] }
  >();

  for (const livery of data.result) {
    if (!aircraftMap.has(livery.aircraftName)) {
      aircraftMap.set(livery.aircraftName, {
        aircraftID: livery.aircraftID,
        liveries: [],
      });
    }
    aircraftMap.get(livery.aircraftName)!.liveries.push(livery.liveryName);
  }

  const totalAircraft = aircraftMap.size;
  let totalLiveries = 0;
  for (const { liveries } of aircraftMap.values()) {
    totalLiveries += liveries.length;
  }

  const serialized = JSON.stringify([...aircraftMap.entries()]);
  const memoryBytes = Buffer.byteLength(serialized, 'utf8');
  const memoryMiB = (memoryBytes / (1024 * 1024)).toFixed(2);

  logger.info(`\n=== Summary ===`);
  logger.info(`Total aircraft : ${totalAircraft}`);
  logger.info(`Total liveries : ${totalLiveries}`);
  logger.info(`Approx cache size (JSON): ${memoryMiB} MiB`);

  for (const [aircraftName, { aircraftID, liveries }] of aircraftMap) {
    logger.info(`\n${aircraftName} (${aircraftID})`);
    logger.info('-'.repeat(aircraftName.length + aircraftID.length + 3));
    for (const livery of liveries) {
      logger.info(`  • ${livery}`);
    }
  }
}

main();
