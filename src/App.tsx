import { useState } from "react";
import { useClock } from "./hooks/useClock";
import { useUpdater } from "./hooks/useUpdater";
import { CityCard } from "./components/CityCard";
import { TimeSlider } from "./components/TimeSlider";
import { Settings } from "./components/Settings";

export default function App() {
  const {
    cities,
    baseIndex,
    sliderOffset,
    effectiveDate,
    use24Hour,
    setUse24Hour,
    setSliderOffset,
    setBase,
    resetToNow,
    addCity,
    removeCity,
  } = useClock();

  const { update, installing, installUpdate, upToDate } = useUpdater();
  const [showSettings, setShowSettings] = useState(false);
  const baseCity = cities[baseIndex] ?? cities[0];

  return (
    <div style={{
      height: "100vh",
      background: "#0c0c14",
      color: "#e8e8f0",
      fontFamily: "'Instrument Serif', Georgia, serif",
      overflow: "hidden",
      position: "relative",
      borderRadius: "0px",
    }}>
      {showSettings && (
        <Settings
          cities={cities}
          baseIndex={baseIndex}
          use24Hour={use24Hour}
          onToggle24Hour={() => setUse24Hour((prev: boolean) => !prev)}
          onAddCity={addCity}
          onRemoveCity={removeCity}
          onSetBase={setBase}
          onClose={() => setShowSettings(false)}
        />
      )}

      <div style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ padding: "14px 16px 0", flexShrink: 0 }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "8px",
          }}>
            <div>
              <div style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "9px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                opacity: 0.4,
                marginBottom: "6px",
              }}>
                World Clock · {cities.length} Cities
              </div>
              <h1 style={{
                fontSize: "24px",
                fontWeight: 400,
                margin: 0,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                fontStyle: "italic",
              }}>
                시차 비교
              </h1>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#e8e8f0",
                padding: "6px 12px",
                borderRadius: "100px",
                fontFamily: "'DM Mono', monospace",
                fontSize: "11px",
                cursor: "pointer",
                marginTop: "4px",
              }}
            >
              ⚙️
            </button>
          </div>
        </div>

        {/* Update Banner */}
        {update && (
          <div style={{
            margin: "0 16px",
            padding: "8px 12px",
            borderRadius: "10px",
            background: "rgba(108,99,255,0.12)",
            border: "1px solid rgba(108,99,255,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}>
            <span style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "11px",
              color: "#a5a0ff",
            }}>
              v{update.version} 업데이트 가능
            </span>
            <button
              onClick={installUpdate}
              disabled={installing}
              style={{
                background: "rgba(108,99,255,0.25)",
                border: "1px solid rgba(108,99,255,0.4)",
                color: "#a5a0ff",
                padding: "3px 10px",
                borderRadius: "100px",
                fontFamily: "'DM Mono', monospace",
                fontSize: "10px",
                cursor: installing ? "default" : "pointer",
                fontWeight: 600,
                opacity: installing ? 0.5 : 1,
              }}
            >
              {installing ? "설치 중..." : "업데이트"}
            </button>
          </div>
        )}

        {/* Up-to-date Toast */}
        {upToDate && (
          <div style={{
            margin: "0 16px",
            padding: "8px 12px",
            borderRadius: "10px",
            background: "rgba(34,197,94,0.10)",
            border: "1px solid rgba(34,197,94,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}>
            <span style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "11px",
              color: "#86efac",
            }}>
              최신 버전입니다
            </span>
          </div>
        )}

        {/* Slider */}
        <div style={{ padding: "0 16px", flexShrink: 0 }}>
          <TimeSlider
            baseCity={baseCity}
            effectiveDate={effectiveDate}
            sliderOffset={sliderOffset}
            onSliderChange={setSliderOffset}
            onReset={resetToNow}
          />
        </div>

        {/* City Cards */}
        <div style={{
          flex: 1,
          overflow: "auto",
          padding: "0 16px 12px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}>
          {cities.map((city, idx) => (
            <CityCard
              key={city.timezone}
              city={city}
              effectiveDate={effectiveDate}
              isBase={idx === baseIndex}
              baseTimezone={baseCity.timezone}
              use24Hour={use24Hour}
              onClick={() => setBase(idx)}
            />
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: "8px 20px 12px",
          textAlign: "center",
          fontFamily: "'DM Mono', monospace",
          fontSize: "10px",
          opacity: 0.2,
          letterSpacing: "0.05em",
          flexShrink: 0,
        }}>
          DST 자동 반영 · Intl API 기반
        </div>
      </div>
    </div>
  );
}
