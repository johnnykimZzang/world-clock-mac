export type DayState = "dawn" | "day" | "dusk" | "night";

export function getTimeInTimezone(timezone: string, date: Date): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(date);

  const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0");
  return { hour: hour === 24 ? 0 : hour, minute };
}

export function formatTime24(hour: number, minute: number): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function formatTime12(hour: number, minute: number): { display: string; period: string } {
  const period = hour >= 12 ? "PM" : "AM";
  const display12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return { display: `${display12}:${String(minute).padStart(2, "0")}`, period };
}

export function getDayState(hour: number): DayState {
  if (hour >= 6 && hour < 8) return "dawn";
  if (hour >= 8 && hour < 17) return "day";
  if (hour >= 17 && hour < 19) return "dusk";
  return "night";
}

export function getDayEmoji(state: DayState): string {
  switch (state) {
    case "dawn": return "🌅";
    case "day": return "☀️";
    case "dusk": return "🌇";
    case "night": return "🌙";
  }
}

export function getDayLabel(state: DayState): string {
  switch (state) {
    case "dawn": return "새벽";
    case "day": return "낮";
    case "dusk": return "저녁";
    case "night": return "밤";
  }
}

export function getTimezoneAbbreviation(timezone: string, date: Date): string {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "short",
  });
  const parts = fmt.formatToParts(date);
  return parts.find((p) => p.type === "timeZoneName")?.value ?? "";
}

export function getHourOffset(baseTimezone: string, targetTimezone: string, date: Date): number {
  const baseOffset = getUtcOffsetMinutes(baseTimezone, date);
  const targetOffset = getUtcOffsetMinutes(targetTimezone, date);
  return (targetOffset - baseOffset) / 60;
}

function getUtcOffsetMinutes(timezone: string, date: Date): number {
  const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  const tzDate = new Date(date.toLocaleString("en-US", { timeZone: timezone }));
  return (tzDate.getTime() - utcDate.getTime()) / 60000;
}

/** Create a Date shifted by a slider offset in minutes */
export function dateWithOffset(offsetMinutes: number): Date {
  return new Date(Date.now() + offsetMinutes * 60000);
}
