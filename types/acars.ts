export interface UserFlight {
  id: string;
  created: string;
  userId: string;
  aircraftId: string;
  liveryId: string;
  server: string;
  dayTime: number;
  nightTime: number;
  totalTime: number;
  landingCount: number;
  originAirport: string | null;
  destinationAirport: string | null;
  xp: number;
  worldType: number;
  violations: Array<{
    issuedBy: {
      id: string;
      username: string;
      callsign: string;
      discourseUser?: {
        userId: number;
        username: string;
        virtualOrganization: string;
        avatarTemplate: string;
      };
    };
    level: number;
    type: string;
    description: string;
    created: string;
  }>;
}

export interface IFUserFlightsResponse {
  errorCode: number;
  result: {
    pageIndex: number;
    totalPages: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    data: UserFlight[];
  };
}

export type { AircraftLivery, LiveriesResponse } from './shared';

export interface PirepFormData {
  flightNumber: string;
  cargo: number;
  fuel: number;
  comments?: string;
}

export interface PirepCreationData {
  flightNumber: string;
  date: Date;
  departureIcao: string;
  arrivalIcao: string;
  flightTime: number;
  cargo: number;
  fuelBurned: number;
  aircraftId: string;
  multiplierId?: string;
  comments?: string;
}
