export const SUPPORTED_INDIAN_STATES = [
  "Maharashtra",
  "Karnataka",
  "Tamil Nadu",
  "Andhra Pradesh",
  "Telangana",
  "Gujarat",
  "Rajasthan",
  "Punjab",
  "Haryana",
  "Uttar Pradesh",
  "Bihar",
  "Madhya Pradesh",
  "West Bengal",
  "Odisha",
  "Kerala"
] as const;

export type SupportedState = typeof SUPPORTED_INDIAN_STATES[number];

export const LAND_RECORD_TYPES = {
  MAHARASHTRA: "7/12 Extract (Satbara)",
  KARNATAKA: "RTC (Pahani)",
  TAMIL_NADU: "Patta / Chitta",
  TELANGANA: "Dharani Passbook",
  ANDHRA_PRADESH: "Meebhoomi 1B",
  PUNJAB: "Jamabandi Nakal",
  UTTAR_PRADESH: "Khatauni / Khasra",
  GUJARAT: "AnyRoR VF7"
} as const;
