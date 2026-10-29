import { cityMeta } from "./cities";

export type DayState = "dawn" | "day" | "dusk" | "night";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

// Intl formatters are expensive to build; reuse one per timezone
const partsFormatters = new Map<string, Intl.DateTimeFormat>();
function partsFormatter(timezone: string): Intl.DateTimeFormat {
  let fmt = partsFormatters.get(timezone);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      weekday: "short",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    });
    partsFormatters.set(timezone, fmt);
  }
  return fmt;
}

export interface LocalParts {
  year: number;
  month: number;
  day: number;
  /** 0 = Sunday */
  weekday: number;
  hour: number;
  minute: number;
  second: number;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"];

export function localParts(timezone: string, date: Date): LocalParts {
  const p: Record<string, string> = {};
  for (const { type, value } of partsFormatter(timezone).formatToParts(date)) p[type] = value;
  const hour = parseInt(p.hour);
  return {
    year: parseInt(p.year),
    month: parseInt(p.month),
    day: parseInt(p.day),
    weekday: WEEKDAYS.indexOf(p.weekday),
    hour: hour === 24 ? 0 : hour,
    minute: parseInt(p.minute),
    second: parseInt(p.second),
  };
}

export function getTimeInTimezone(timezone: string, date: Date): { hour: number; minute: number } {
  const { hour, minute } = localParts(timezone, date);
  return { hour, minute };
}

export function formatTime24(hour: number, minute: number): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function formatTime12(hour: number, minute: number): { display: string; period: string } {
  const period = hour >= 12 ? "PM" : "AM";
  const display12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return { display: `${display12}:${String(minute).padStart(2, "0")}`, period };
}

export function getDayLabel(state: DayState): string {
  switch (state) {
    case "dawn": return "새벽";
    case "day": return "낮";
    case "dusk": return "저녁";
    case "night": return "밤";
  }
}

export function utcOffsetMinutes(timezone: string, date: Date): number {
  const p = localParts(timezone, date);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - Math.floor(date.getTime() / 1000) * 1000) / MINUTE);
}

export function getHourOffset(baseTimezone: string, targetTimezone: string, date: Date): number {
  return (utcOffsetMinutes(targetTimezone, date) - utcOffsetMinutes(baseTimezone, date)) / 60;
}

export function formatHourDiff(diff: number): string {
  if (diff === 0) return "±0h";
  const sign = diff > 0 ? "+" : "−";
  const abs = Math.abs(diff);
  const h = Math.trunc(abs);
  const m = Math.round((abs - h) * 60);
  return m ? `${sign}${h}:${String(m).padStart(2, "0")}h` : `${sign}${h}h`;
}

function isDst(timezone: string, date: Date): boolean {
  const year = date.getUTCFullYear();
  const jan = utcOffsetMinutes(timezone, new Date(Date.UTC(year, 0, 1)));
  const jul = utcOffsetMinutes(timezone, new Date(Date.UTC(year, 6, 1)));
  return jan !== jul && utcOffsetMinutes(timezone, date) === Math.max(jan, jul);
}

/** Abbreviation that is correct for the given instant (CET vs CEST, GMT vs BST…) */
export function timezoneAbbr(timezone: string, date: Date, fallback = ""): string {
  const meta = cityMeta(timezone);
  if (meta) return meta.abbr[isDst(timezone, date) ? 1 : 0];
  const name = new Intl.DateTimeFormat("en-US", { timeZone: timezone, timeZoneName: "short" })
    .formatToParts(date)
    .find((p) => p.type === "timeZoneName")?.value;
  return name ?? fallback;
}

/** Whole days between the local calendar dates of two timezones (−1 = yesterday, 1 = tomorrow) */
export function relativeDay(baseTimezone: string, timezone: string, date: Date): number {
  const a = localParts(baseTimezone, date);
  const b = localParts(timezone, date);
  return Math.round((Date.UTC(b.year, b.month - 1, b.day) - Date.UTC(a.year, a.month - 1, a.day)) / (24 * HOUR));
}

export function relativeDayLabel(days: number): string {
  if (days === 0) return "오늘";
  if (days === 1) return "내일";
  if (days === -1) return "어제";
  return days > 0 ? `${days}일 후` : `${-days}일 전`;
}

/** Instant of local midnight for the calendar day containing `date` in `timezone` */
export function localMidnight(timezone: string, date: Date): Date {
  const p = localParts(timezone, date);
  const sinceMidnight = (p.hour * 3600 + p.minute * 60 + p.second) * 1000 + (date.getTime() % 1000);
  return new Date(date.getTime() - sinceMidnight);
}

/* ── Work status ─────────────────────────────────────────── */

export type WorkStatus = "work" | "before" | "after" | "sleep" | "weekend";

export const WORK_START = 9;
export const WORK_END = 18;

export function workStatus(timezone: string, date: Date): WorkStatus {
  const { hour, weekday } = localParts(timezone, date);
  if (hour >= 23 || hour < 7) return "sleep";
  if (weekday === 0 || weekday === 6) return "weekend";
  if (hour < WORK_START) return "before";
  if (hour < WORK_END) return "work";
  return "after";
}

export const WORK_LABEL: Record<WorkStatus, string> = {
  work: "근무 중",
  before: "출근 전",
  after: "퇴근 후",
  sleep: "수면 중",
  weekend: "주말",
};

/**
 * Hour-by-hour count of cities inside working hours, laid out on the base
 * city's local day (index 0 = 00:00–01:00 in the base timezone).
 */
export function workOverlap(baseTimezone: string, timezones: string[], date: Date): number[] {
  const midnight = localMidnight(baseTimezone, date).getTime();
  return Array.from({ length: 24 }, (_, h) => {
    const at = new Date(midnight + h * HOUR + 30 * MINUTE);
    return timezones.filter((tz) => workStatus(tz, at) === "work").length;
  });
}

/** Longest run of hours sharing the highest overlap count (needs at least two cities) */
export function bestOverlapWindow(counts: number[]): { start: number; end: number; count: number } | null {
  const max = Math.max(...counts);
  if (max < 2) return null;
  let best = { start: 0, end: 0, count: max };
  let runStart = -1;
  for (let h = 0; h <= 24; h++) {
    if (h < 24 && counts[h] === max) {
      if (runStart < 0) runStart = h;
    } else if (runStart >= 0) {
      if (h - runStart > best.end - best.start) best = { start: runStart, end: h, count: max };
      runStart = -1;
    }
  }
  return best;
}

/* ── Daylight saving transitions ─────────────────────────── */

export interface OffsetChange {
  at: Date;
  before: number;
  after: number;
}

/** First UTC-offset change for `timezone` within `days` after `from`, to the minute */
export function nextOffsetChange(timezone: string, from: Date, days = 7): OffsetChange | null {
  const step = 6 * HOUR;
  const before = utcOffsetMinutes(timezone, from);
  const end = from.getTime() + days * 24 * HOUR;
  let lo = from.getTime();
  for (let t = lo + step; t <= end; t += step) {
    if (utcOffsetMinutes(timezone, new Date(t)) === before) {
      lo = t;
      continue;
    }
    let hi = t;
    while (hi - lo > MINUTE) {
      const mid = lo + Math.floor((hi - lo) / 2);
      if (utcOffsetMinutes(timezone, new Date(mid)) === before) lo = mid;
      else hi = mid;
    }
    return { at: new Date(hi), before, after: utcOffsetMinutes(timezone, new Date(hi)) };
  }
  return null;
}

/** Epoch minute used as the anchor for offset snapping */
export function nowEpochMinute(): number {
  return Math.floor(Date.now() / MINUTE);
}

/**
 * Snap a preview offset so the previewed time lands on a `step`-minute grid.
 * Every real-world UTC offset is a multiple of 15 minutes, so a UTC grid is
 * also a local grid in every city.
 */
export function snapOffset(offset: number, step: number, dir: -1 | 0 | 1 = 0): number {
  const now = nowEpochMinute();
  const m = now + offset;
  const target =
    dir > 0 ? Math.floor(m / step) * step + step
    : dir < 0 ? Math.ceil(m / step) * step - step
    : Math.round(m / step) * step;
  return target - now;
}

/** Create a Date shifted by a slider offset in minutes */
export function dateWithOffset(offsetMinutes: number): Date {
  return new Date(Date.now() + offsetMinutes * MINUTE);
}
