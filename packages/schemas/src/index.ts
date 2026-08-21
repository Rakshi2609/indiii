export interface LandRecord {
  id: string;
  state: string;
  district: string;
  taluk: string;
  village: string;
  surveyNumber: string;
  subDivisionNumber?: string;
  extent: {
    value: number;
    unit: "acres" | "hectares" | "gunthas" | "bighas" | "sq_yards" | "sq_meters";
  };
  owners: Array<{
    name: string;
    fatherOrHusbandName?: string;
    shareRatio?: number;
    mutationEntryNumber?: string;
  }>;
  encumbranceStatus: "clear" | "mortgaged" | "disputed" | "under_litigation";
  cadastralCoordinates?: [number, number][];
}

export interface HealthCheckResponse {
  status: string;
  app_name: string;
  version: string;
  environment: string;
  timestamp: string;
}
