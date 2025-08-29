export interface AircraftLivery {
  name: string;
  aircraftID: string;
  liveries: Array<{ id: string; name: string }>;
}

export interface LiveriesResponse {
  aircraft: AircraftLivery[];
}
