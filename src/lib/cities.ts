export interface City {
  name: string;
  flag: string;
  timezone: string; // IANA timezone ID
  label: string;
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
];
