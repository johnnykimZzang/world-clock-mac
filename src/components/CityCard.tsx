import { useState } from "react";
import type { City } from "../lib/cities";
import {
  getTimeInTimezone,
  formatTime12,
  getDayState,
  getDayEmoji,
  getDayLabel,
  getHourOffset,
} from "../lib/time";
import { PALETTES } from "../lib/palette";
import { StarField } from "./StarField";

interface CityCardProps {
  city: City;
  effectiveDate: Date;
  isBase: boolean;
  baseTimezone: string;
  onClick: () => void;
}

export function CityCard({ city, effectiveDate, isBase, baseTimezone, onClick }: CityCardProps) {
  const [hovered, setHovered] = useState(false);
  const { hour, minute } = getTimeInTimezone(city.timezone, effectiveDate);
  const { display, period } = formatTime12(hour, minute);
  const state = getDayState(hour);
  const palette = PALETTES[state];
  const diff = getHourOffset(baseTimezone, city.timezone, effectiveDate);
  const diffStr = diff === 0 ? "기준" : `${diff > 0 ? "+" : ""}${diff}h`;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: palette.bg,
        borderRadius: "14px",
        padding: "14px 16px",
        color: palette.text,
        position: "relative",
        overflow: "hidden",
        transition: "all 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: !isBase && hovered ? "translateY(-2px)" : "translateY(0)",
        border: isBase ? `2px solid ${palette.accent}` : "2px solid transparent",
        boxShadow: isBase
          ? `0 6px 24px ${palette.glow}, 0 0 0 1px ${palette.accent}44, inset 0 1px 0 rgba(255,255,255,0.1)`
          : `0 4px 16px ${palette.glow}, inset 0 1px 0 rgba(255,255,255,0.1)`,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {state === "night" && <StarField />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
        <div>
          <div style={{ fontSize: "20px", marginBottom: "1px", lineHeight: 1 }}>{city.flag}</div>
          <div style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: "15px",
            fontWeight: 400,
            letterSpacing: "-0.02em",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}>
            {city.name}
            {isBase && (
              <span style={{
                fontSize: "8px",
                fontFamily: "'DM Mono', monospace",
                background: `${palette.accent}33`,
                color: palette.accent,
                padding: "2px 6px",
                borderRadius: "100px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}>
                기준
              </span>
            )}
          </div>
        </div>
        <div style={{
          fontSize: "10px",
          fontFamily: "'DM Mono', monospace",
          opacity: 0.7,
          textAlign: "right",
          lineHeight: 1.5,
        }}>
          <div>{city.label}</div>
          <div style={{ color: palette.accent, fontWeight: 600 }}>{diffStr}</div>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 1, marginTop: "4px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
          <span style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "28px",
            fontWeight: 500,
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}>
            {display}
          </span>
          <span style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "12px",
            opacity: 0.6,
            fontWeight: 400,
          }}>
            {period}
          </span>
        </div>
        <div style={{
          fontSize: "11px",
          marginTop: "3px",
          opacity: 0.5,
          fontFamily: "'DM Mono', monospace",
        }}>
          {getDayEmoji(state)} {getDayLabel(state)}
          {!isBase && <span style={{ marginLeft: "6px", opacity: 0.7 }}>· 클릭하여 기준 변경</span>}
        </div>
      </div>
    </div>
  );
}
