import { useState } from "react";
import { useClock } from "./hooks/useClock";
import { CityCard } from "./components/CityCard";
import { TimeSlider } from "./components/TimeSlider";
import { Settings } from "./components/Settings";

export default function App() {
  const {
    cities,
    baseIndex,
    sliderOffset,
    effectiveDate,
    setSliderOffset,
    setBase,
    resetToNow,
    addCity,
    removeCity,
  } = useClock();

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
