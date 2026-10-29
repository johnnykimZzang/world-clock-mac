import { useMemo, useState } from "react";
import type { City } from "../lib/cities";
import {
  WEEKDAYS_KO,
  formatHourDiff,
  localParts,
  nextOffsetChange,
  utcOffsetMinutes,
} from "../lib/time";

const DISMISSED_KEY = "world-clock-dst-dismissed";
const LOOKAHEAD_DAYS = 7;

interface Notice {
  key: string;
  title: string;
  when: string;
  daysLeft: number;
  detail: string;
}

function loadDismissed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) ?? "[]");
  } catch {
    return [];
  }
}

/** Upcoming daylight-saving switches that change a city's offset from the base city */
function buildNotices(cities: City[], base: City, now: Date): Notice[] {
  const notices: Notice[] = [];
  const baseChange = nextOffsetChange(base.timezone, now, LOOKAHEAD_DAYS);

  for (const city of cities) {
    const change = city.timezone === base.timezone ? baseChange : nextOffsetChange(city.timezone, now, LOOKAHEAD_DAYS);
    if (!change) continue;

    const justBefore = new Date(change.at.getTime() - 60_000);
    const baseBefore = utcOffsetMinutes(base.timezone, justBefore);
    const baseAfter = utcOffsetMinutes(base.timezone, change.at);
    const diffBefore = (change.before - baseBefore) / 60;
    const diffAfter = (change.after - baseAfter) / 60;
    const isBase = city.timezone === base.timezone;
    if (!isBase && diffBefore === diffAfter) continue;

    const lp = localParts(city.timezone, change.at);
    const daysLeft = Math.max(0, Math.ceil((change.at.getTime() - now.getTime()) / 86_400_000));
    notices.push({
      key: `${city.timezone}|${change.at.getTime()}`,
      title: `${isBase ? "기준 도시 " : ""}${city.name} 서머타임 ${change.after > change.before ? "시작" : "종료"}`,
      when: `${lp.month}/${lp.day} (${WEEKDAYS_KO[lp.weekday]})`,
      daysLeft,
      detail: isBase
        ? `현지 시각이 ${formatHourDiff((change.after - change.before) / 60)} 바뀌어요`
        : `시차 ${formatHourDiff(diffBefore)} → ${formatHourDiff(diffAfter)}`,
    });
  }
  return notices.sort((a, b) => a.daysLeft - b.daysLeft);
}

export function DstNotices({ cities, base }: { cities: City[]; base: City }) {
  const [dismissed, setDismissed] = useState(loadDismissed);
  // Recompute at most once an hour; transitions are days apart
  const hourKey = Math.floor(Date.now() / 3_600_000);
  const timezones = cities.map((c) => c.timezone).join("|");
  const notices = useMemo(
    () => buildNotices(cities, base, new Date()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [timezones, base.timezone, hourKey],
  );
  const visible = notices.filter((n) => !dismissed.includes(n.key)).slice(0, 2);
  if (!visible.length) return null;

  const dismiss = (key: string) => {
    const next = [...dismissed, key].slice(-20);
    setDismissed(next);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
  };

  return (
    <div className="notices">
      {visible.map((n) => (
        <div key={n.key} className="glass notice">
          <span className="notice-badge tnum">{n.daysLeft === 0 ? "오늘" : `D-${n.daysLeft}`}</span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="notice-title">{n.title} · {n.when}</div>
            <div className="notice-detail tnum">{n.detail}</div>
          </div>
          <button className="icon-btn small" onClick={() => dismiss(n.key)} aria-label="알림 닫기">✕</button>
        </div>
      ))}
    </div>
  );
}
