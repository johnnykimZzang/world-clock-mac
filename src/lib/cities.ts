export interface City {
  name: string;
  flag: string;
  timezone: string; // IANA timezone ID
  label: string;
}

interface CityMeta {
  lat: number;
  lon: number;
  /** Abbreviations for [standard time, daylight saving time] */
  abbr: [string, string];
}

export const DEFAULT_CITIES: City[] = [
  { name: "Seoul", flag: "🇰🇷", timezone: "Asia/Seoul", label: "KST" },
  { name: "Los Angeles", flag: "🇺🇸", timezone: "America/Los_Angeles", label: "PT" },
  { name: "Paris", flag: "🇫🇷", timezone: "Europe/Paris", label: "CET" },
  { name: "London", flag: "🇬🇧", timezone: "Europe/London", label: "GMT" },
  { name: "Bangkok", flag: "🇹🇭", timezone: "Asia/Bangkok", label: "ICT" },
];

// All available cities for settings
export const ALL_CITIES: City[] = [
  ...DEFAULT_CITIES,
  { name: "New York", flag: "🇺🇸", timezone: "America/New_York", label: "ET" },
  { name: "Tokyo", flag: "🇯🇵", timezone: "Asia/Tokyo", label: "JST" },
  { name: "Sydney", flag: "🇦🇺", timezone: "Australia/Sydney", label: "AEST" },
  { name: "Dubai", flag: "🇦🇪", timezone: "Asia/Dubai", label: "GST" },
  { name: "Singapore", flag: "🇸🇬", timezone: "Asia/Singapore", label: "SGT" },
  { name: "Berlin", flag: "🇩🇪", timezone: "Europe/Berlin", label: "CET" },
  { name: "Shanghai", flag: "🇨🇳", timezone: "Asia/Shanghai", label: "CST" },
  { name: "São Paulo", flag: "🇧🇷", timezone: "America/Sao_Paulo", label: "BRT" },
  { name: "Mumbai", flag: "🇮🇳", timezone: "Asia/Kolkata", label: "IST" },
  { name: "Toronto", flag: "🇨🇦", timezone: "America/Toronto", label: "ET" },
  { name: "Jakarta", flag: "🇮🇩", timezone: "Asia/Jakarta", label: "WIB" },
  { name: "Istanbul", flag: "🇹🇷", timezone: "Europe/Istanbul", label: "TRT" },
  { name: "Honolulu", flag: "🇺🇸", timezone: "Pacific/Honolulu", label: "HST" },
  { name: "Anchorage", flag: "🇺🇸", timezone: "America/Anchorage", label: "AKT" },
  { name: "Athens", flag: "🇬🇷", timezone: "Europe/Athens", label: "EET" },
];

// Keyed by timezone so cities saved by older versions (without coordinates) still resolve
const META: Record<string, CityMeta> = {
  "Asia/Seoul": { lat: 37.57, lon: 126.98, abbr: ["KST", "KDT"] },
  "America/Los_Angeles": { lat: 34.05, lon: -118.24, abbr: ["PST", "PDT"] },
  "Europe/Paris": { lat: 48.86, lon: 2.35, abbr: ["CET", "CEST"] },
  "Europe/London": { lat: 51.51, lon: -0.13, abbr: ["GMT", "BST"] },
  "Asia/Bangkok": { lat: 13.76, lon: 100.5, abbr: ["ICT", "ICT"] },
  "America/New_York": { lat: 40.71, lon: -74.01, abbr: ["EST", "EDT"] },
  "Asia/Tokyo": { lat: 35.68, lon: 139.69, abbr: ["JST", "JDT"] },
  "Australia/Sydney": { lat: -33.87, lon: 151.21, abbr: ["AEST", "AEDT"] },
  "Asia/Dubai": { lat: 25.2, lon: 55.27, abbr: ["GST", "GST"] },
  "Asia/Singapore": { lat: 1.35, lon: 103.82, abbr: ["SGT", "SGT"] },
  "Europe/Berlin": { lat: 52.52, lon: 13.4, abbr: ["CET", "CEST"] },
  "Asia/Shanghai": { lat: 31.23, lon: 121.47, abbr: ["CST", "CDT"] },
  "America/Sao_Paulo": { lat: -23.55, lon: -46.63, abbr: ["BRT", "BRST"] },
  "Asia/Kolkata": { lat: 19.08, lon: 72.88, abbr: ["IST", "IST"] },
  "America/Toronto": { lat: 43.65, lon: -79.38, abbr: ["EST", "EDT"] },
  "Asia/Jakarta": { lat: -6.21, lon: 106.85, abbr: ["WIB", "WIB"] },
  "Europe/Istanbul": { lat: 41.01, lon: 28.98, abbr: ["TRT", "TRT"] },
  "Pacific/Honolulu": { lat: 21.31, lon: -157.86, abbr: ["HST", "HDT"] },
  "America/Anchorage": { lat: 61.22, lon: -149.9, abbr: ["AKST", "AKDT"] },
  "Europe/Athens": { lat: 37.98, lon: 23.73, abbr: ["EET", "EEST"] },
};

export function cityMeta(timezone: string): CityMeta | undefined {
  return META[timezone];
}
