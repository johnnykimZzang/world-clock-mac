import { cityMeta } from "./cities";
import { localMidnight, utcOffsetMinutes, type DayState } from "./time";

const RAD = Math.PI / 180;
const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;
/** Altitude of the sun's center at sunrise/sunset (refraction + solar radius) */
const HORIZON = -0.833;
/** Civil twilight: below this the sky is night */
const TWILIGHT = -6;

/** Solar altitude in degrees (low-precision almanac formulas, good to ~0.1°) */
export function sunAltitude(date: Date, lat: number, lon: number): number {
  const d = date.getTime() / DAY - 10957.5; // days since J2000.0
  const g = (357.529 + 0.98560028 * d) * RAD;
  const q = 280.459 + 0.98564736 * d;
  const L = (q + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * RAD;
  const e = (23.439 - 0.00000036 * d) * RAD;
  const ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L));
  const dec = Math.asin(Math.sin(e) * Math.sin(L));
  const gmst = (18.697374558 + 24.06570982441908 * d) * 15 * RAD;
  const ha = gmst + lon * RAD - ra;
  const phi = lat * RAD;
  return Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(ha)) / RAD;
}

export interface SunTimes {
  sunrise: Date | null;
  sunset: Date | null;
  /** Highest altitude reached that day */
  noonAltitude: number;
}

const sunTimesCache = new Map<string, SunTimes>();

/** Sunrise/sunset for the local calendar day containing `date` (null in polar day/night) */
export function sunTimes(timezone: string, date: Date, lat: number, lon: number): SunTimes {
  const midnight = localMidnight(timezone, date).getTime();
  const key = `${timezone}|${midnight}`;
  const hit = sunTimesCache.get(key);
  if (hit) return hit;

  const step = 10 * MINUTE;
  let sunrise: Date | null = null;
  let sunset: Date | null = null;
  let noonAltitude = -90;
  let prev = sunAltitude(new Date(midnight), lat, lon);
  for (let t = midnight + step; t <= midnight + DAY; t += step) {
    const alt = sunAltitude(new Date(t), lat, lon);
    noonAltitude = Math.max(noonAltitude, alt);
    const crossed = (prev - HORIZON) * (alt - HORIZON) <= 0 && prev !== alt;
    if (crossed) {
      const at = new Date(t - step + ((HORIZON - prev) / (alt - prev)) * step);
      if (alt > prev) sunrise ??= at;
      else sunset ??= at;
    }
    prev = alt;
  }

  const result = { sunrise, sunset, noonAltitude };
  if (sunTimesCache.size > 256) sunTimesCache.clear();
  sunTimesCache.set(key, result);
  return result;
}

/** 0 = new moon, 0.5 = full moon */
export function moonPhase(date: Date): number {
  const synodic = 29.530588853;
  const days = (date.getTime() - Date.UTC(2000, 0, 6, 18, 14)) / DAY;
  return (((days % synodic) + synodic) % synodic) / synodic;
}

export function moonPhaseLabel(phase: number): string {
  const names = ["삭", "초승달", "상현달", "차가는 달", "보름달", "기우는 달", "하현달", "그믐달"];
  return names[Math.round(phase * 8) % 8];
}

export interface Sky {
  state: DayState;
  altitude: number;
  sunrise: Date | null;
  sunset: Date | null;
  /** True while the light source is the sun (incl. twilight), false for the moon */
  isSun: boolean;
  /** Light-source position inside a tile, in percent */
  orb: { x: number; y: number };
  moon: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Where the sun (or moon) is in this city's sky, seasons included */
export function skyFor(timezone: string, date: Date): Sky {
  const meta = cityMeta(timezone);
  // Unknown city: put it on the equator at the longitude matching its UTC offset
  const lat = meta?.lat ?? 0;
  const lon = meta?.lon ?? utcOffsetMinutes(timezone, date) / 4;

  const altitude = sunAltitude(date, lat, lon);
  const rising = sunAltitude(new Date(date.getTime() + 10 * MINUTE), lat, lon) > altitude;
  const state: DayState =
    altitude >= 6 ? "day" : altitude < TWILIGHT ? "night" : rising ? "dawn" : "dusk";

  const { sunrise, sunset, noonAltitude } = sunTimes(timezone, date, lat, lon);
  const now = date.getTime();
  const isSun = state !== "night";
  let t = 0.5;
  let y: number;

  if (isSun) {
    if (sunrise && sunset && sunset > sunrise) {
      t = clamp((now - sunrise.getTime()) / (sunset.getTime() - sunrise.getTime()), -0.04, 1.04);
    } else {
      t = rising ? 0.25 : 0.75;
    }
    // Height follows the real altitude, scaled to that day's noon so winter arcs stay low
    const peak = Math.max(noonAltitude, 12);
    y = 82 - clamp((altitude - TWILIGHT) / (peak - TWILIGHT), 0, 1) * (peak / 90 * 40 + 28);
  } else {
    if (sunrise && sunset) {
      const [from, to] =
        now < sunrise.getTime()
          ? [sunset.getTime() - DAY, sunrise.getTime()]
          : [sunset.getTime(), sunrise.getTime() + DAY];
      t = clamp((now - from) / (to - from), 0, 1);
    }
    y = 72 - Math.sin(t * Math.PI) * 48;
  }

  return { state, altitude, sunrise, sunset, isSun, orb: { x: 10 + t * 80, y }, moon: moonPhase(date) };
}
