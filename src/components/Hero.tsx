import { useMemo, useRef } from "react";
import type { City } from "../lib/cities";
import {
  WEEKDAYS_KO,
  WORK_END,
  WORK_START,
  bestOverlapWindow,
  formatTime12,
  formatTime24,
  getDayLabel,
  localMidnight,
  localParts,
  timezoneAbbr,
  workOverlap,
  type DayState,
} from "../lib/time";
import { moonPhaseLabel, skyFor } from "../lib/sun";
import { ORB, SkyOrb } from "./SkyOrb";
import { Dial } from "./Dial";

const MAX_OFFSET = 48 * 60;
const WHEEL_STEP_PX = 36;

interface HeroProps {
  city: City;
  cities: City[];
  effectiveDate: Date;
  offset: number;
  use24Hour: boolean;
  onOffsetChange: (update: (prev: number) => number) => void;
  onScrubEnd: () => void;
  onWheelStep: (dir: -1 | 1) => void;
  onReset: () => void;
  onOpenSettings: () => void;
}

function formatOffset(offset: number): string {
  const sign = offset > 0 ? "+" : "−";
  const abs = Math.abs(offset);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (!h) return `${sign}${m}분`;
  return m ? `${sign}${h}시간 ${m}분` : `${sign}${h}시간`;
}

/** Rail gradient that follows this city's real dawn/day/dusk/night for the shown day */
function useSkyGradient(timezone: string, date: Date): string {
  const midnight = localMidnight(timezone, date).getTime();
  return useMemo(() => {
    const stops: string[] = [];
    let last: DayState | null = null;
    for (let i = 0; i <= 96; i++) {
      const state = skyFor(timezone, new Date(midnight + i * 15 * 60_000)).state;
      if (state !== last) {
        const pct = (i / 96) * 100;
        if (last) stops.push(`color-mix(in srgb, ${ORB[last]} 55%, transparent) ${pct}%`);
        stops.push(`color-mix(in srgb, ${ORB[state]} 55%, transparent) ${pct}%`);
        last = state;
      }
    }
    stops.push(`color-mix(in srgb, ${ORB[last!]} 55%, transparent) 100%`);
    return `linear-gradient(90deg, ${stops.join(", ")})`;
  }, [timezone, midnight]);
}

export function Hero({ city, cities, effectiveDate, offset, use24Hour, onOffsetChange, onScrubEnd, onWheelStep, onReset, onOpenSettings }: HeroProps) {
  const p = localParts(city.timezone, effectiveDate);
  const sky = skyFor(city.timezone, effectiveDate);
  const minuteOfDay = p.hour * 60 + p.minute;
  const gradient = useSkyGradient(city.timezone, effectiveDate);
  const wheel = useRef(0);

  const minuteKey = Math.floor(effectiveDate.getTime() / 60_000);
  const timezones = cities.map((c) => c.timezone).join("|");
  const overlap = useMemo(
    () => workOverlap(city.timezone, timezones.split("|"), effectiveDate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [city.timezone, timezones, Math.floor(minuteKey / 60)],
  );
  const best = bestOverlapWindow(overlap);

  const shiftTo = (targetMinuteOfDay: number) =>
    onOffsetChange((prev) => prev + targetMinuteOfDay - minuteOfDay);

  const scrubBy = (delta: number) =>
    onOffsetChange((prev) => Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, prev + delta)));

  const onWheel = (e: React.WheelEvent) => {
    const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    // A mouse-wheel notch is one step; trackpad deltas are small and accumulate
    if (e.deltaMode !== 0 || Math.abs(delta) >= 50) {
      wheel.current = 0;
      onWheelStep(delta > 0 ? 1 : -1);
      return;
    }
    wheel.current += delta;
    while (Math.abs(wheel.current) >= WHEEL_STEP_PX) {
      const dir = wheel.current > 0 ? 1 : -1;
      wheel.current -= dir * WHEEL_STEP_PX;
      onWheelStep(dir);
    }
  };

  const time = use24Hour ? formatTime24(p.hour, p.minute) : formatTime12(p.hour, p.minute).display;
  const fmt = (d: Date | null) => {
    if (!d) return "—";
    const lp = localParts(city.timezone, d);
    return formatTime24(lp.hour, lp.minute);
  };
  const nowMinute = (() => {
    const n = localParts(city.timezone, new Date());
    return n.hour * 60 + n.minute;
  })();
  const workCount = overlap[p.hour];

  return (
    <section className="glass hero" onWheel={onWheel}>
      {/* Glow only: a crisp disc would sit on top of the big time */}
      <SkyOrb sky={sky} glow={150} />
      <button className="icon-btn hero-gear" onClick={onOpenSettings} aria-label="설정">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
      </button>

      <div className="hero-main">
        <Dial
          hour={p.hour}
          minute={p.minute}
          onScrub={scrubBy}
          onScrubEnd={onScrubEnd}
        />
        <div style={{ minWidth: 0 }}>
          <div className="meta">
            {city.flag} {timezoneAbbr(city.timezone, effectiveDate, city.label)} · 기준 · {getDayLabel(sky.state)}
          </div>
          <div className="hero-name">{city.name}</div>
          <div className="hero-time tnum">
            {time}
            {!use24Hour && <span className="period">{formatTime12(p.hour, p.minute).period}</span>}
          </div>
          <div className="hero-sub tnum">
            {p.month}/{p.day} ({WEEKDAYS_KO[p.weekday]}) · ↑{fmt(sky.sunrise)} ↓{fmt(sky.sunset)}
            {!sky.isSun && <> · {moonPhaseLabel(sky.moon)}</>}
          </div>
        </div>
      </div>

      <div className={`preview-row${offset ? " on" : ""}`} aria-hidden={!offset}>
        <div className="preview-pill">
          <span className="tnum">{formatOffset(offset)} 미리보기</span>
          <button onClick={onReset} tabIndex={offset ? 0 : -1}>지금으로</button>
        </div>
      </div>

      <div className="rail">
        <div className="rail-track" style={{ background: gradient }} />
        {offset !== 0 && (
          <span className="rail-now" style={{ left: `calc(${nowMinute / 1439} * (100% - 14px) + 7px)` }} />
        )}
        <input
          type="range"
          min="0"
          max="1439"
          value={minuteOfDay}
          onChange={(e) => shiftTo(parseInt(e.target.value))}
          onPointerUp={onScrubEnd}
          className="rail-input"
          aria-label="기준 시각"
        />
      </div>
      <div className="rail-labels tnum">
        {["00", "06", "12", "18", "24"].map((h) => <span key={h}>{h}</span>)}
      </div>

      <div className="overlap" role="group" aria-label="업무시간 겹침">
        <div className="overlap-cells">
          {overlap.map((n, h) => (
            <button
              key={h}
              className={`overlap-cell${h === p.hour ? " here" : ""}${best && h >= best.start && h < best.end ? " best" : ""}`}
              style={{ opacity: n ? 0.2 + (n / cities.length) * 0.8 : 1 }}
              data-count={n}
              onClick={() => shiftTo(h * 60)}
              title={`${String(h).padStart(2, "0")}시 · ${n}/${cities.length} 도시 근무 중`}
            />
          ))}
        </div>
        <div className="overlap-caption">
          <span>
            <i className="dot work" /> 지금 {workCount}/{cities.length} 근무 중
          </span>
          <span className="tnum">
            {best
              ? `최다 겹침 ${String(best.start).padStart(2, "0")}–${String(best.end).padStart(2, "0")}시 · ${best.count}곳`
              : `겹치는 업무시간 없음 (${WORK_START}–${WORK_END}시 기준)`}
          </span>
        </div>
      </div>
    </section>
  );
}
