import type { AircraftLivery, LiveriesResponse } from './shared';

export type { AircraftLivery, LiveriesResponse };

export interface FlightEntry {
  flightId: string;
  userId: string;
  aircraftId: string;
  liveryId: string;
  username: string | null;
  virtualOrganization: string | null;
  callsign: string;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number; // ground speed in kts
  verticalSpeed: number;
  track: number;
  heading: number;
  lastReport: string;
  pilotState: number;
  isConnected: boolean;
}

export interface LiveAPIResponse {
  errorCode: number;
  result: FlightEntry[];
}

export interface FlightPlanItem {
  name: string;
  type: number;
  children: FlightPlanItem[] | null;
  identifier: string | null;
  altitude: number;
  location: {
    latitude: number;
    longitude: number;
    altitude: number;
  };
}

export interface FlightPlanInfo {
  flightPlanId: string;
  flightId: string;
  waypoints: string[];
  lastUpdate: string;
  flightPlanItems: FlightPlanItem[];
  flightPlanType: number;
}

export interface FlightPlanResponse {
  errorCode: number;
  result: FlightPlanInfo;
}

export interface FlightData {
  flights: FlightEntry[];
  aircraftMap: Map<string, AircraftLivery>;
  liveryMap: Map<string, { name: string; aircraftId: string }>;
}

export interface ProcessedFlightData extends FlightData {
  flightPlans: Map<string, FlightPlanInfo>;
}

export interface FlightCacheEntry {
  data: FlightData;
  timestamp: number;
  airlineName: string;
  airlineData: {
    liveFilterType?: string;
    liveFilterSuffix?: string;
    liveFilterVirtualOrg?: string;
  };
}

export interface FlightPlanCacheEntry {
  data: FlightPlanInfo;
  timestamp: number;
}
