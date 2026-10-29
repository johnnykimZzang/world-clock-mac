import { useCallback, useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useClock } from "./hooks/useClock";
import { useUpdater } from "./hooks/useUpdater";
import { useSystemLook } from "./hooks/useSystemLook";
import { Hero } from "./components/Hero";
import { CityTile } from "./components/CityTile";
import { DstNotices } from "./components/DstNotices";
import { Settings } from "./components/Settings";
import { snapOffset } from "./lib/time";

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

  useSystemLook();
  const { update, installing, installUpdate, upToDate } = useUpdater();
  const [showSettings, setShowSettings] = useState(false);
  const baseCity = cities[baseIndex] ?? cities[0];

  // Esc closes settings first, then the popover itself
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (showSettings) setShowSettings(false);
      else getCurrentWindow().hide().catch(() => {});
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showSettings]);

  // Dial drags settle on a 5-minute grid, trackpad/wheel steps move 15 minutes
  const onScrubEnd = useCallback(() => setSliderOffset((o) => snapOffset(o, 5)), [setSliderOffset]);
  const onWheelStep = useCallback((dir: -1 | 1) => setSliderOffset((o) => snapOffset(o, 15, dir)), [setSliderOffset]);

  return (
    <div className="popover">
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

      <header className="head">
        <div>
          <div className="meta">World Clock · {cities.length} Cities</div>
          <h1 className="title">시차 비교</h1>
        </div>
        <button className="icon-btn" onClick={() => setShowSettings(true)} aria-label="설정">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </header>

      {update && (
        <div className="banner accent">
          <span>v{update.version} 업데이트 가능</span>
          <button onClick={installUpdate} disabled={installing}>
            {installing ? "설치 중..." : "업데이트"}
          </button>
        </div>
      )}
      {upToDate && <div className="banner ok">최신 버전입니다</div>}

      <DstNotices cities={cities} base={baseCity} />

      <Hero
        city={baseCity}
        cities={cities}
        effectiveDate={effectiveDate}
        offset={sliderOffset}
        use24Hour={use24Hour}
        onOffsetChange={setSliderOffset}
        onScrubEnd={onScrubEnd}
        onWheelStep={onWheelStep}
        onReset={resetToNow}
      />

      <div className="tiles">
        {cities.map((city, idx) =>
          idx === baseIndex ? null : (
            <CityTile
              key={city.timezone}
              city={city}
              index={idx}
              effectiveDate={effectiveDate}
              baseTimezone={baseCity.timezone}
              use24Hour={use24Hour}
              onClick={() => setBase(idx)}
            />
          ),
        )}
      </div>
    </div>
  );
}
