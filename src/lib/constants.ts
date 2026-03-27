export const APP_NAME = "Family Footy Tips";
export const APP_DESCRIPTION =
  "A simple AFL tipping site for Mum, Dad, Ben, and Lucy with automatic fixtures and easy mobile use.";

export const AFL_SEASON_YEAR = 2026;
export const MEMBER_COOKIE_NAME = "family_footy_member";

export const FAMILY_MEMBERS = [
  { slug: "mum", name: "Mum" },
  { slug: "dad", name: "Dad" },
  { slug: "ben", name: "Ben" },
  { slug: "lucy", name: "Lucy" },
] as const;

export const TEAM_SHORT_NAMES: Record<string, string> = {
  Adelaide: "ADE",
  "Brisbane Lions": "BL",
  Carlton: "CAR",
  Collingwood: "COL",
  Essendon: "ESS",
  Fremantle: "FRE",
  Geelong: "GEE",
  "Gold Coast": "GC",
  GWS: "GWS",
  Hawthorn: "HAW",
  Melbourne: "MEL",
  "North Melbourne": "NM",
  "Port Adelaide": "PA",
  Richmond: "RIC",
  "St Kilda": "STK",
  Sydney: "SYD",
  "West Coast": "WCE",
  "Western Bulldogs": "WB",
};

export type FamilyMemberSlug = (typeof FAMILY_MEMBERS)[number]["slug"];

