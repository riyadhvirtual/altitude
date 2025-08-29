export type UserStats = {
  userId: string;
  virtualOrganization: string | null;
  discourseUsername: string | null;
  groups: string[];
  roles: number[];
  errorCode: number;
  onlineFlights: number;
  violations: number;
  violationCountByLevel: {
    level1: number;
    level2: number;
    level3: number;
  };
  xp: number;
  landingCount: number;
  flightTime: number;
  atcOperations: number;
  atcRank: number | null;
  grade: number;
  hash: string;
};

export type IFUsersResponse = {
  errorCode: number;
  result: UserStats[];
};
