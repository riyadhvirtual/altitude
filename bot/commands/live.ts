import type {
  ButtonInteraction,
  ChatInputCommandInteraction,
} from 'discord.js';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';

import { getAirline } from '@/db/queries/airline';
import { decrypt } from '@/lib/encryption';
import { getIFLiveries, getIFSession } from '@/lib/if-api';
import { formatHoursMinutes } from '@/lib/utils';
import { createDiscordEmbed } from '@/lib/webhooks';
import type {
  AircraftLivery,
  FlightCacheEntry,
  FlightData,
  FlightEntry,
  FlightPlanCacheEntry,
  FlightPlanInfo,
  FlightPlanItem,
  FlightPlanResponse,
  LiveAPIResponse,
  LiveriesResponse,
} from '@/types/live';

const ITEMS_PER_PAGE = 3;

const FLIGHT_PLAN_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

let cache: FlightCacheEntry | null = null;

const flightPlanCache = new Map<string, FlightPlanCacheEntry>();

function createLookupMaps(liveriesData: LiveriesResponse): {
  aircraftMap: Map<string, AircraftLivery>;
  liveryMap: Map<string, { name: string; aircraftId: string }>;
} {
  const aircraftMap = new Map<string, AircraftLivery>();
  const liveryMap = new Map<string, { name: string; aircraftId: string }>();
  for (const aircraft of liveriesData.aircraft) {
    aircraftMap.set(aircraft.aircraftID, aircraft);
    for (const livery of aircraft.liveries) {
      liveryMap.set(livery.id, {
        name: livery.name,
        aircraftId: aircraft.aircraftID,
      });
    }
  }
  return { aircraftMap, liveryMap };
}

async function fetchFlightPlan(
  flightId: string,
  apiKey: string,
  sessionId: string
): Promise<FlightPlanInfo | null> {
  try {
    const cached = flightPlanCache.get(flightId);
    if (cached && Date.now() - cached.timestamp < FLIGHT_PLAN_CACHE_TTL) {
      return cached.data;
    }
    const flightPlanURL = `https://api.infiniteflight.com/public/v2/sessions/${sessionId}/flights/${flightId}/flightplan?apikey=${apiKey}`;
    const response = await fetch(flightPlanURL, { cache: 'no-store' });
    if (!response.ok) {
      return null;
    }
    const data: FlightPlanResponse = await response.json();
    if (data.errorCode !== 0) {
      return null;
    }
    flightPlanCache.set(flightId, {
      data: data.result,
      timestamp: Date.now(),
    });
    return data.result;
  } catch {
    return null;
  }
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function kmToNm(km: number): number {
  return km * 0.539957;
}

function findActiveLegIndex(
  currentLat: number,
  currentLon: number,
  items: FlightPlanItem[]
): number {
  if (items.length < 2) {
    return 0;
  }
  let bestWaypointIdx = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let i = 0; i < items.length; i++) {
    const waypoint = items[i].location;
    const distance = calculateDistance(
      currentLat,
      currentLon,
      waypoint.latitude,
      waypoint.longitude
    );
    if (distance < bestDistance) {
      bestDistance = distance;
      bestWaypointIdx = i;
    }
  }
  let estimatedLegIdx = bestWaypointIdx;
  const closestDistanceNm = kmToNm(bestDistance);
  if (closestDistanceNm <= 100) {
    estimatedLegIdx = Math.min(bestWaypointIdx + 1, items.length - 2);
  }
  if (bestWaypointIdx > items.length * 0.5) {
    estimatedLegIdx = Math.min(bestWaypointIdx + 2, items.length - 2);
  }
  return estimatedLegIdx;
}

function createProgressBar(
  current: number,
  target: number,
  length: number = 10
): string {
  if (target <= 0) {
    return '█'.repeat(length);
  }
  const progress = Math.min(current / target, 1);
  const filledBlocks = Math.round(progress * length);
  const emptyBlocks = length - filledBlocks;
  return '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
}

function calculateFlightProgress(
  currentLat: number,
  currentLon: number,
  flightPlan: FlightPlanInfo,
  speedKts: number
): { progress: number; progressBar: string; ete: string } {
  const items = flightPlan.flightPlanItems;
  if (!items || items.length < 2) {
    return {
      progress: 0,
      progressBar: createProgressBar(0, 1),
      ete: 'N/A',
    };
  }
  const departurePoint = items[0].location;
  const destinationPoint = items[items.length - 1].location;
  const totalNm = kmToNm(
    calculateDistance(
      departurePoint.latitude,
      departurePoint.longitude,
      destinationPoint.latitude,
      destinationPoint.longitude
    )
  );
  const safeTotal = Math.max(totalNm, 1e-6);
  const legIdx = findActiveLegIndex(currentLat, currentLon, items);
  if (legIdx >= items.length - 1) {
    return {
      progress: 100,
      progressBar: createProgressBar(100, 100),
      ete: '0m',
    };
  }
  const destination = items[items.length - 1].location;
  let remainingNm = kmToNm(
    calculateDistance(
      currentLat,
      currentLon,
      destination.latitude,
      destination.longitude
    )
  );
  remainingNm = Math.max(0, Math.min(remainingNm, totalNm));
  const pct = ((safeTotal - remainingNm) / safeTotal) * 100;
  const progress = Math.max(0, Math.min(pct, 100));
  const progressBar = createProgressBar(progress, 100);
  let ete = 'N/A';
  if (progress > 1) {
    const hours = remainingNm / speedKts;
    const totalMinutes = Math.round(hours * 60);
    ete = formatHoursMinutes(totalMinutes);
  }
  return { progress, progressBar, ete };
}

function getRouteFromFlightPlan(flightPlan: FlightPlanInfo): string {
  const items = flightPlan.flightPlanItems;
  if (!items || items.length === 0) {
    return 'No flight plan filed';
  }
  const firstWaypoint = items[0];
  const lastWaypoint = items[items.length - 1];
  const departure = firstWaypoint.name;
  let arrival = lastWaypoint.name;
  if (lastWaypoint.children && lastWaypoint.children.length > 0) {
    const runwayWaypoint = lastWaypoint.children.find(
      (child) => child.name.startsWith('RW') || child.name.includes('RUNWAY')
    );
    if (runwayWaypoint) {
      arrival = runwayWaypoint.name;
    }
  }
  return `${departure} → ${arrival}`;
}

async function fetchFlightData(): Promise<
  (FlightData & { sessionId: string }) | null
> {
  const airlineData = await getAirline();
  if (!airlineData?.infiniteFlightApiKey) {
    return null;
  }
  const apiKey = decrypt(airlineData.infiniteFlightApiKey);
  const session = await getIFSession();
  if (!session) {
    return null;
  }
  const sessionId = session.id;
  const flightsAPI_URL = `https://api.infiniteflight.com/public/v2/sessions/${sessionId}/flights?apikey=${apiKey}`;
  const [flightsResponse, liveriesData] = await Promise.all([
    fetch(flightsAPI_URL, { cache: 'no-store' }),
    getIFLiveries(),
  ]);
  if (!flightsResponse.ok) {
    throw new Error(`API request failed: flights(${flightsResponse.status})`);
  }
  const flightsData: LiveAPIResponse = await flightsResponse.json();
  if (flightsData.errorCode !== 0) {
    throw new Error(`Infinite Flight API error: ${flightsData.errorCode}`);
  }
  const filteredFlights = flightsData.result.filter((flight: FlightEntry) => {
    if (
      airlineData.liveFilterType === 'suffix' &&
      airlineData.liveFilterSuffix
    ) {
      return flight.callsign.endsWith(airlineData.liveFilterSuffix);
    }
    if (
      airlineData.liveFilterType === 'virtual_org' &&
      airlineData.liveFilterVirtualOrg
    ) {
      return flight.virtualOrganization === airlineData.liveFilterVirtualOrg;
    }
    return false;
  });
  const uniqueFlights = filteredFlights.filter(
    (flight, index, arr) =>
      arr.findIndex((f) => f.flightId === flight.flightId) === index
  );
  const { aircraftMap, liveryMap } = createLookupMaps(liveriesData);
  const flightData: FlightData = {
    flights: uniqueFlights,
    aircraftMap,
    liveryMap,
  };
  cache = {
    data: flightData,
    timestamp: Date.now(),
    airlineName: airlineData.name,
    airlineData: {
      liveFilterType: airlineData.liveFilterType || undefined,
      liveFilterSuffix: airlineData.liveFilterSuffix || undefined,
      liveFilterVirtualOrg: airlineData.liveFilterVirtualOrg || undefined,
    },
  };
  return { ...flightData, sessionId };
}

async function fetchFlightPlansStreaming(
  flights: FlightEntry[],
  apiKey: string,
  sessionId: string,
  onUpdate: (flightId: string, flightPlan: FlightPlanInfo | null) => void
): Promise<Map<string, FlightPlanInfo>> {
  const flightPlans = new Map<string, FlightPlanInfo>();
  const uniqueFlights = flights.filter(
    (flight, index, arr) =>
      arr.findIndex((f) => f.flightId === flight.flightId) === index
  );
  const promises = uniqueFlights.map(async (flight) => {
    try {
      const flightPlan = await fetchFlightPlan(
        flight.flightId,
        apiKey,
        sessionId
      );
      if (flightPlan) {
        flightPlans.set(flight.flightId, flightPlan);
      }
      onUpdate(flight.flightId, flightPlan);
      return { flightId: flight.flightId, flightPlan };
    } catch {
      onUpdate(flight.flightId, null);
      return { flightId: flight.flightId, flightPlan: null };
    }
  });
  await Promise.allSettled(promises);
  return flightPlans;
}

function formatFlightInfo(
  flight: FlightEntry,
  index: number,
  aircraftMap: Map<string, AircraftLivery>,
  liveryMap: Map<string, { name: string; aircraftId: string }>,
  flightPlan?: FlightPlanInfo
): string {
  const altitude = Math.round(flight.altitude);
  const speed = Math.round(flight.speed);
  const aircraftInfo = aircraftMap.get(flight.aircraftId);
  const liveryInfo = liveryMap.get(flight.liveryId);
  const aircraftDisplay = aircraftInfo
    ? `${aircraftInfo.name} (${liveryInfo?.name || 'Default'})`
    : 'Unknown Aircraft';
  let route: string;
  let progressData: { progress: number; progressBar: string; ete: string };
  if (flightPlan) {
    route = getRouteFromFlightPlan(flightPlan);
    progressData = calculateFlightProgress(
      flight.latitude,
      flight.longitude,
      flightPlan,
      flight.speed
    );
  } else {
    route = 'No flight plan filed';
    progressData = {
      progress: 0,
      progressBar: createProgressBar(0, 1) + ' (0%)',
      ete: 'N/A',
    };
  }
  const progressLine = flightPlan
    ? `🎯 **Progress:** ${progressData.progressBar} (${Math.round(
        progressData.progress
      )}%)`
    : `🎯 **Progress:** ${progressData.progressBar}`;
  const lines = [
    `**${index + 1}. ${flight.callsign}**`,
    `👤 **Pilot:** ${flight.username || 'Unknown'}`,
    `✈️ **Aircraft:** ${aircraftDisplay}`,
    `🛣️ **Route:** ${route}`,
    `📊 **Altitude:** ${altitude.toLocaleString()}ft`,
    `🚀 **Speed (GS):** ${speed.toLocaleString()}kts`,
    progressLine,
  ];
  lines.push(`⏱️ **ETE:** ${progressData.ete}`);
  return lines.join('\n');
}

function createFlightsEmbed(
  flights: FlightEntry[],
  aircraftMap: Map<string, AircraftLivery>,
  liveryMap: Map<string, { name: string; aircraftId: string }>,
  flightPlans: Map<string, FlightPlanInfo>,
  currentPage: number,
  airlineName: string,
  airlineData: {
    liveFilterType?: string;
    liveFilterSuffix?: string;
    liveFilterVirtualOrg?: string;
  }
) {
  const totalPages = Math.ceil(flights.length / ITEMS_PER_PAGE);
  if (flights.length === 0) {
    let filterDescription = 'no filter configured';
    if (
      airlineData.liveFilterType === 'suffix' &&
      airlineData.liveFilterSuffix
    ) {
      filterDescription = `callsigns ending in "${airlineData.liveFilterSuffix}"`;
    } else if (
      airlineData.liveFilterType === 'virtual_org' &&
      airlineData.liveFilterVirtualOrg
    ) {
      filterDescription = `from "${airlineData.liveFilterVirtualOrg}"`;
    }
    return {
      embed: createDiscordEmbed({
        title: '🛫 Live Flights',
        description: `No flights found with ${filterDescription}.`,
        color: 0x95a5a6,
        footer: { text: airlineName },
        timestamp: new Date().toISOString(),
      }),
      totalPages: 1,
    };
  }
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentFlights = flights.slice(startIndex, endIndex);
  const flightLines = currentFlights.map((flight, idx) => {
    const flightPlan = flightPlans.get(flight.flightId);
    return formatFlightInfo(
      flight,
      startIndex + idx,
      aircraftMap,
      liveryMap,
      flightPlan
    );
  });
  const footerText = `${airlineName} • Page ${currentPage} of ${totalPages}`;
  const embed = createDiscordEmbed({
    title: '🛫 Live Flights',
    description: flightLines.join('\n\n'),
    color: 0x3498db,
    footer: { text: footerText },
    timestamp: new Date().toISOString(),
  });
  return { embed, totalPages };
}

function createPaginationButtons(currentPage: number, totalPages: number) {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`live_prev_${currentPage}`)
      .setLabel('Previous')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('⬅️')
      .setDisabled(currentPage === 1),
    new ButtonBuilder()
      .setCustomId(`live_next_${currentPage}`)
      .setLabel('Next')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('➡️')
      .setDisabled(currentPage === totalPages)
  );
}

export async function handleButton(interaction: ButtonInteraction) {
  try {
    const customId = interaction.customId;
    const [action, direction, pageStr] = customId.split('_');
    if (action !== 'live') {
      return;
    }
    const currentPage = parseInt(pageStr);
    const newPage = direction === 'prev' ? currentPage - 1 : currentPage + 1;

    // Just use the existing cache for pagination, don't refetch basic flight data
    if (!cache) {
      await interaction.reply({
        content: '❌ Flight data not available. Please run the command again.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Validate the new page number
    const maxPages = Math.ceil(cache.data.flights.length / ITEMS_PER_PAGE);
    if (newPage < 1 || newPage > maxPages) {
      await interaction.reply({
        content: '❌ Invalid page number.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Get flights for the current page only
    const startIndex = (newPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentPageFlights = cache.data.flights.slice(startIndex, endIndex);

    // Fetch all flight plans for the new page before updating the embed
    const flightPlans = new Map<string, FlightPlanInfo>();
    const now = Date.now();

    // Check cache first
    for (const flight of currentPageFlights) {
      const cachedPlan = flightPlanCache.get(flight.flightId);
      if (cachedPlan && now - cachedPlan.timestamp < FLIGHT_PLAN_CACHE_TTL) {
        flightPlans.set(flight.flightId, cachedPlan.data);
      }
    }

    // Fetch missing flight plans
    const flightsNeedingPlans = currentPageFlights.filter(
      (flight) => !flightPlans.has(flight.flightId)
    );

    if (flightsNeedingPlans.length > 0) {
      const airlineData = await getAirline();
      if (airlineData?.infiniteFlightApiKey) {
        const apiKey = decrypt(airlineData.infiniteFlightApiKey);
        const session = await getIFSession();
        if (session) {
          await fetchFlightPlansStreaming(
            flightsNeedingPlans,
            apiKey,
            session.id,
            (flightId, flightPlan) => {
              if (flightPlan) {
                flightPlans.set(flightId, flightPlan);
              }
            }
          );
        }
      }
    }

    const { embed, totalPages } = createFlightsEmbed(
      cache.data.flights,
      cache.data.aircraftMap,
      cache.data.liveryMap,
      flightPlans,
      newPage,
      cache.airlineName,
      cache.airlineData
    );
    const row = createPaginationButtons(newPage, totalPages);
    await interaction.update({ embeds: [embed], components: [row] });
  } catch {
    const errorMessage = '❌ Failed to update flight data.';
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
  }
}

export const data = new SlashCommandBuilder()
  .setName('live')
  .setDescription('Display live flights from Infinite Flight');

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    await interaction.deferReply();
    const flightData = await fetchFlightData();
    if (!flightData || !cache) {
      await interaction.editReply({
        content:
          '❌ Infinite Flight API key not configured. Please configure it in the admin settings.',
      });
      return;
    }

    // Fetch all flight plans first before posting the embed
    const flightPlans = new Map<string, FlightPlanInfo>();
    if (flightData.flights.length > 0) {
      const airlineData = await getAirline();
      if (airlineData?.infiniteFlightApiKey) {
        const apiKey = decrypt(airlineData.infiniteFlightApiKey);
        const now = Date.now();

        // Get flights for the first page
        const currentPageFlights = flightData.flights.slice(0, ITEMS_PER_PAGE);
        const flightsNeedingPlans = currentPageFlights.filter((flight) => {
          const cachedPlan = flightPlanCache.get(flight.flightId);
          if (
            cachedPlan &&
            now - cachedPlan.timestamp < FLIGHT_PLAN_CACHE_TTL
          ) {
            flightPlans.set(flight.flightId, cachedPlan.data);
            return false;
          }
          return true;
        });

        if (flightsNeedingPlans.length > 0) {
          await fetchFlightPlansStreaming(
            flightsNeedingPlans,
            apiKey,
            flightData.sessionId,
            (flightId, flightPlan) => {
              if (flightPlan) {
                flightPlans.set(flightId, flightPlan);
              }
            }
          );
        }
      }
    }

    const { embed, totalPages } = createFlightsEmbed(
      flightData.flights,
      flightData.aircraftMap,
      flightData.liveryMap,
      flightPlans,
      1,
      cache.airlineName,
      cache.airlineData
    );
    const row =
      totalPages > 1 ? createPaginationButtons(1, totalPages) : undefined;
    await interaction.editReply({
      embeds: [embed],
      components: row ? [row] : [],
    });
  } catch {
    const errorMessage = '❌ Failed to fetch live flights.';
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
  }
}
