import { useState, useCallback, useMemo } from "react";

const CITIES = [
  { name: "Seoul", flag: "🇰🇷", offset: 9, label: "KST" },
  { name: "Los Angeles", flag: "🇺🇸", offset: -7, label: "PDT" },
  { name: "Paris", flag: "🇫🇷", offset: 2, label: "CEST" },
  { name: "London", flag: "🇬🇧", offset: 1, label: "BST" },
  { name: "Bangkok", flag: "🇹🇭", offset: 7, label: "ICT" },
];

function mod(n, m) {
  return ((n % m) + m) % m;
}

function getCityMinutes(utcMinutes, offset) {
  return mod(utcMinutes + offset * 60, 1440);
}

function formatTime24(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function formatTime12(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const period = h >= 12 ? "PM" : "AM";
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return { display: `${display}:${String(m).padStart(2, "0")}`, period };
}

function getDayState(h) {
  if (h >= 6 && h < 8) return "dawn";
  if (h >= 8 && h < 17) return "day";
  if (h >= 17 && h < 19) return "dusk";
  return "night";
}

function getDayEmoji(state) {
  return state === "night" ? "🌙" : state === "dawn" ? "🌅" : state === "dusk" ? "🌇" : "☀️";
}

const PALETTES = {
  dawn: { bg: "linear-gradient(135deg, #2d1b4e 0%, #e8a87c 50%, #ffd89b 100%)", text: "#1a1a2e", accent: "#e8a87c", glow: "rgba(232,168,124,0.3)" },
  day: { bg: "linear-gradient(135deg, #dce8f5 0%, #f0f4f8 50%, #e8edf3 100%)", text: "#1a1a2e", accent: "#4a7baa", glow: "rgba(74,123,170,0.15)" },
  dusk: { bg: "linear-gradient(135deg, #1a1a2e 0%, #c06c84 40%, #f67280 100%)", text: "#fef0e4", accent: "#f67280", glow: "rgba(246,114,128,0.3)" },
  night: { bg: "linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #16213e 100%)", text: "#e8e8f0", accent: "#6c63ff", glow: "rgba(108,99,255,0.25)" },
};

const starPositions = Array.from({ length: 12 }, () => ({
  w: 1 + Math.random() * 2,
  top: Math.random() * 100,
  left: Math.random() * 100,
  dur: 2 + Math.random() * 3,
  delay: Math.random() * 2,
}));

function CityCard({ city, utcMinutes, isBase, onClick, baseOffset }) {
  const localMinutes = getCityMinutes(utcMinutes, city.offset);
  const h = Math.floor(localMinutes / 60);
  const { display, period } = formatTime12(localMinutes);
  const state = getDayState(h);
  const palette = PALETTES[state];
  const diffHours = city.offset - baseOffset;
  const diffStr = diffHours === 0 ? "기준" : `${diffHours > 0 ? "+" : ""}${diffHours}h`;

  return (
    <div
      onClick={onClick}
      style={{
        background: palette.bg,
        borderRadius: "16px",
        padding: "24px 28px",
        color: palette.text,
        position: "relative",
        overflow: "hidden",
        transition: "all 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
        border: isBase ? `2px solid ${palette.accent}` : "2px solid transparent",
        boxShadow: isBase
          ? `0 8px 32px ${palette.glow}, 0 0 0 1px ${palette.accent}44, inset 0 1px 0 rgba(255,255,255,0.1)`
          : `0 8px 32px ${palette.glow}, inset 0 1px 0 rgba(255,255,255,0.1)`,
        minHeight: "120px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => { if (!isBase) e.currentTarget.style.transform = "translateY(-3px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {state === "night" && starPositions.map((s, i) => (
        <div key={i} style={{
          position: "absolute", width: `${s.w}px`, height: `${s.w}px`,
          background: "rgba(255,255,255,0.5)", borderRadius: "50%",
          top: `${s.top}%`, left: `${s.left}%`,
          animation: `twinkle ${s.dur}s ease-in-out infinite`,
          animationDelay: `${s.delay}s`,
        }} />
      ))}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
        <div>
          <div style={{ fontSize: "28px", marginBottom: "2px", lineHeight: 1 }}>{city.flag}</div>
          <div style={{
            fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "20px",
            fontWeight: 400, letterSpacing: "-0.02em",
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            {city.name}
            {isBase && (
              <span style={{
                fontSize: "9px", fontFamily: "'DM Mono', monospace",
                background: `${palette.accent}33`, color: palette.accent,
                padding: "2px 8px", borderRadius: "100px", fontWeight: 600,
                letterSpacing: "0.08em", textTransform: "uppercase",
              }}>기준</span>
            )}
          </div>
        </div>
        <div style={{
          fontSize: "11px", fontFamily: "'DM Mono', monospace",
          opacity: 0.7, textAlign: "right", lineHeight: 1.5,
        }}>
          <div>{city.label}</div>
          <div style={{ color: palette.accent, fontWeight: 600 }}>{diffStr}</div>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 1, marginTop: "12px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: "42px",
            fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1,
          }}>{display}</span>
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: "14px",
            opacity: 0.6, fontWeight: 400,
          }}>{period}</span>
        </div>
        <div style={{
          fontSize: "12px", marginTop: "4px", opacity: 0.5,
          fontFamily: "'DM Mono', monospace",
        }}>
          {getDayEmoji(state)} {state === "dawn" ? "새벽" : state === "day" ? "낮" : state === "dusk" ? "저녁" : "밤"}
          {!isBase && <span style={{ marginLeft: "6px", opacity: 0.7 }}>· 클릭하여 기준 변경</span>}
        </div>
      </div>
    </div>
  );
}

/* ─── Slider tick component ─── */
function SliderTicks() {
  const ticks = [];
  for (let h = 0; h < 24; h++) {
    const isMajor = h % 6 === 0;
    const isHalf = h % 3 === 0 && !isMajor;
    const pct = (h / 24) * 100;
    const state = getDayState(h);

    ticks.push(
      <div key={h} style={{
        position: "absolute", left: `${pct}%`, top: 0, bottom: 0,
        display: "flex", flexDirection: "column", alignItems: "center",
        transform: "translateX(-50%)", width: "32px",
      }}>
        <div style={{
          width: "1px",
          height: isMajor ? "14px" : isHalf ? "8px" : "5px",
          background: isMajor ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.12)",
          marginBottom: "4px",
        }} />
        {(isMajor || isHalf) && (
          <span style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: isMajor ? "11px" : "9px",
            color: isMajor ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.25)",
            fontWeight: isMajor ? 500 : 300,
            whiteSpace: "nowrap", lineHeight: 1,
          }}>
            {String(h).padStart(2, "0")}
          </span>
        )}
        {isMajor && (
          <span style={{ fontSize: "10px", marginTop: "2px", opacity: 0.5 }}>
            {getDayEmoji(state)}
          </span>
        )}
      </div>
    );
  }
  return <div style={{ position: "relative", height: "42px", marginTop: "6px" }}>{ticks}</div>;
}

export default function TimezoneCompare() {
  const now = new Date();
  const initUtc = now.getUTCHours() * 60 + now.getUTCMinutes();

  const [utcMinutes, setUtcMinutes] = useState(initUtc);
  const [baseIdx, setBaseIdx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const baseCity = CITIES[baseIdx];
  const baseLocalMinutes = getCityMinutes(utcMinutes, baseCity.offset);
  const baseH = Math.floor(baseLocalMinutes / 60);
  const baseState = getDayState(baseH);
  const mainPalette = PALETTES[baseState];

  const handleSlider = useCallback((e) => {
    const sliderVal = parseInt(e.target.value);
    setUtcMinutes(mod(sliderVal - CITIES[baseIdx].offset * 60, 1440));
  }, [baseIdx]);

  const handleCardClick = useCallback((idx) => {
    setBaseIdx(idx);
  }, []);

  const resetToNow = useCallback(() => {
    const n = new Date();
    setUtcMinutes(n.getUTCHours() * 60 + n.getUTCMinutes());
  }, []);

  const sliderPercent = (baseLocalMinutes / 1439) * 100;

  const zones = useMemo(() => [
    { start: 0, end: 25, color: "rgba(108,99,255,0.35)" },
    { start: 25, end: 33.3, color: "rgba(232,168,124,0.3)" },
    { start: 33.3, end: 70.8, color: "rgba(74,123,170,0.2)" },
    { start: 70.8, end: 79.2, color: "rgba(246,114,128,0.3)" },
    { start: 79.2, end: 100, color: "rgba(108,99,255,0.35)" },
  ], []);

  return (
    <div style={{
      minHeight: "100vh", background: "#0c0c14", color: "#e8e8f0",
      fontFamily: "'Instrument Serif', Georgia, serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Instrument+Serif:ital@0;1&display=swap');

        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        .tz-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 8px;
          border-radius: 4px;
          outline: none;
          cursor: pointer;
          position: relative;
          z-index: 2;
          background: transparent;
        }
        .tz-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #fff;
          cursor: grab;
          box-shadow: 0 2px 12px rgba(0,0,0,0.5), 0 0 0 3px rgba(255,255,255,0.15);
          transition: box-shadow 0.2s, transform 0.15s;
        }
        .tz-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 2px 16px rgba(0,0,0,0.6), 0 0 0 5px rgba(255,255,255,0.2);
        }
        .tz-slider::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.1);
          box-shadow: 0 2px 20px rgba(0,0,0,0.6), 0 0 0 6px rgba(255,255,255,0.25);
        }
        .tz-slider::-moz-range-thumb {
          width: 24px; height: 24px; border-radius: 50%;
          background: #fff; cursor: grab; border: none;
          box-shadow: 0 2px 12px rgba(0,0,0,0.5), 0 0 0 3px rgba(255,255,255,0.15);
        }

        .reset-btn {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          color: #e8e8f0;
          padding: 8px 18px;
          border-radius: 100px;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.05em;
        }
        .reset-btn:hover {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.25);
        }

        .city-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 16px;
        }
        @media (max-width: 640px) {
          .city-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "48px 24px 64px" }}>
        {/* Header */}
        <div style={{ marginBottom: "48px" }}>
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: "11px",
            letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.4, marginBottom: "12px",
          }}>
            World Clock · 5 Cities
          </div>
          <h1 style={{
            fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 400, margin: 0,
            letterSpacing: "-0.03em", lineHeight: 1.1, fontStyle: "italic",
          }}>시차 비교</h1>
          <p style={{
            fontFamily: "'DM Mono', monospace", fontSize: "13px",
            opacity: 0.35, marginTop: "8px", fontWeight: 300,
          }}>
            도시 카드를 클릭하면 기준 시각이 전환됩니다
          </p>
        </div>

        {/* Slider Section */}
        <div style={{
          background: "rgba(255,255,255,0.04)", borderRadius: "20px",
          padding: "28px 28px 16px", marginBottom: "32px",
          border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(20px)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <span style={{ fontSize: "32px", lineHeight: 1 }}>{baseCity.flag}</span>
              <div>
                <div style={{
                  fontFamily: "'DM Mono', monospace", fontSize: "10px",
                  opacity: 0.4, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "2px",
                }}>
                  {baseCity.label} · 기준 시각
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                  <span style={{
                    fontFamily: "'DM Mono', monospace", fontSize: "34px",
                    fontWeight: 500, letterSpacing: "-0.03em", color: mainPalette.accent,
                    transition: "color 0.4s",
                  }}>
                    {formatTime24(baseLocalMinutes)}
                  </span>
                  <span style={{
                    fontFamily: "'Instrument Serif', Georgia, serif",
                    fontSize: "18px", fontWeight: 400, opacity: 0.6,
                  }}>
                    {baseCity.name}
                  </span>
                </div>
              </div>
            </div>
            <button className="reset-btn" onClick={resetToNow}>↻ 현재 시각</button>
          </div>

          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute", top: "50%", left: 0, right: 0,
              height: "8px", transform: "translateY(-50%)", borderRadius: "4px",
              overflow: "hidden", zIndex: 1,
            }}>
              {zones.map((z, i) => (
                <div key={i} style={{
                  position: "absolute", left: `${z.start}%`,
                  width: `${z.end - z.start}%`, height: "100%",
                  background: z.color,
                }} />
              ))}
              <div style={{
                position: "absolute", left: 0, width: `${sliderPercent}%`, height: "100%",
                background: `linear-gradient(90deg, ${mainPalette.accent}cc, ${mainPalette.accent})`,
                transition: isDragging ? "none" : "width 0.08s",
              }} />
            </div>

            <input
              type="range" min="0" max="1439"
              value={baseLocalMinutes}
              onChange={handleSlider}
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onTouchStart={() => setIsDragging(true)}
              onTouchEnd={() => setIsDragging(false)}
              className="tz-slider"
            />

            <SliderTicks />
          </div>
        </div>

        {/* City Cards */}
        <div className="city-grid">
          {CITIES.map((city, idx) => (
            <CityCard
              key={city.name}
              city={city}
              utcMinutes={utcMinutes}
              isBase={idx === baseIdx}
              onClick={() => handleCardClick(idx)}
              baseOffset={baseCity.offset}
            />
          ))}
        </div>

        <div style={{
          marginTop: "40px", textAlign: "center",
          fontFamily: "'DM Mono', monospace", fontSize: "11px",
          opacity: 0.2, letterSpacing: "0.05em",
        }}>
          DST 기준 · 실제 시각과 차이가 있을 수 있습니다
        </div>
      </div>
    </div>
  );
}
