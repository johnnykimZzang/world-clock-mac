import { useCallback, useEffect, useRef, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useClock } from "./hooks/useClock";
import { useUpdater } from "./hooks/useUpdater";
import { useSystemLook } from "./hooks/useSystemLook";
import { useFitWindow } from "./hooks/useFitWindow";
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
  const rootRef = useRef<HTMLDivElement>(null);
  useFitWindow(rootRef);
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
    <div ref={rootRef} className={`popover${showSettings ? " settings-open" : ""}`}>
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
        onOpenSettings={() => setShowSettings(true)}
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
