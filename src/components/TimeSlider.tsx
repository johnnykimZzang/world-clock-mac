import type { City } from "../lib/cities";
import { getTimeInTimezone, formatTime24, getDayState, getDayEmoji } from "../lib/time";
import { PALETTES, SLIDER_ZONES } from "../lib/palette";

interface TimeSliderProps {
  baseCity: City;
  effectiveDate: Date;
  sliderOffset: number;
  onSliderChange: (offset: number) => void;
  onReset: () => void;
}

function SliderTicks() {
  const ticks = [];
  for (let h = 0; h < 24; h++) {
    const isMajor = h % 6 === 0;
    const isHalf = h % 3 === 0 && !isMajor;
    const pct = (h / 24) * 100;
    const state = getDayState(h);

    ticks.push(
      <div key={h} style={{
        position: "absolute",
        left: `${pct}%`,
        top: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transform: "translateX(-50%)",
        width: "28px",
      }}>
        <div style={{
          width: "1px",
          height: isMajor ? "12px" : isHalf ? "7px" : "4px",
          background: isMajor ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.12)",
          marginBottom: "3px",
        }} />
        {(isMajor || isHalf) && (
          <span style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: isMajor ? "10px" : "8px",
            color: isMajor ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.25)",
            fontWeight: isMajor ? 500 : 300,
            whiteSpace: "nowrap",
            lineHeight: 1,
          }}>
            {String(h).padStart(2, "0")}
          </span>
        )}
        {isMajor && (
          <span style={{ fontSize: "9px", marginTop: "1px", opacity: 0.5 }}>
            {getDayEmoji(state)}
          </span>
        )}
      </div>
    );
  }
  return <div style={{ position: "relative", height: "38px", marginTop: "4px" }}>{ticks}</div>;
}

export function TimeSlider({ baseCity, effectiveDate, onSliderChange, onReset }: TimeSliderProps) {
  const { hour, minute } = getTimeInTimezone(baseCity.timezone, effectiveDate);
  const baseLocalMinutes = hour * 60 + minute;
  const state = getDayState(hour);
  const palette = PALETTES[state];
  const sliderPercent = (baseLocalMinutes / 1439) * 100;

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetMinutes = parseInt(e.target.value);
    const currentMinutes = (() => {
      const now = new Date();
      const { hour: h, minute: m } = getTimeInTimezone(baseCity.timezone, now);
      return h * 60 + m;
    })();
    onSliderChange(targetMinutes - currentMinutes);
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      borderRadius: "16px",
      padding: "20px 20px 12px",
      marginBottom: "12px",
      border: "1px solid rgba(255,255,255,0.06)",
      backdropFilter: "blur(20px)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "26px", lineHeight: 1 }}>{baseCity.flag}</span>
          <div>
            <div style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "9px",
              opacity: 0.4,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: "1px",
            }}>
              {baseCity.label} · 기준 시각
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
              <span style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "28px",
                fontWeight: 500,
                letterSpacing: "-0.03em",
                color: palette.accent,
                transition: "color 0.4s",
              }}>
                {formatTime24(hour, minute)}
              </span>
              <span style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: "15px",
                fontWeight: 400,
                opacity: 0.6,
              }}>
                {baseCity.name}
              </span>
            </div>
          </div>
        </div>
        <button className="reset-btn" onClick={onReset}>↻ 현재 시각</button>
      </div>

      <div style={{ position: "relative" }}>
        <div style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          height: "6px",
          transform: "translateY(-50%)",
          borderRadius: "3px",
          overflow: "hidden",
          zIndex: 1,
        }}>
          {SLIDER_ZONES.map((z, i) => (
            <div key={i} style={{
              position: "absolute",
              left: `${z.start}%`,
              width: `${z.end - z.start}%`,
              height: "100%",
              background: z.color,
            }} />
          ))}
          <div style={{
            position: "absolute",
            left: 0,
            width: `${sliderPercent}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${palette.accent}cc, ${palette.accent})`,
            transition: "width 0.08s",
          }} />
        </div>

        <input
          type="range"
          min="0"
          max="1439"
          value={baseLocalMinutes}
          onChange={handleSlider}
          className="tz-slider"
        />

        <SliderTicks />
      </div>
    </div>
  );
}
