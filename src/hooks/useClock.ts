import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { City } from "../lib/cities";
import { DEFAULT_CITIES } from "../lib/cities";
import { dateWithOffset } from "../lib/time";

export function useClock() {
  const [cities, setCities] = useState<City[]>(() => {
    const saved = localStorage.getItem("world-clock-cities");
    return saved ? JSON.parse(saved) : DEFAULT_CITIES;
  });
  const [baseIndex, setBaseIndex] = useState(() => {
    const saved = localStorage.getItem("world-clock-base");
    return saved ? parseInt(saved) : 0;
  });
  const [use24Hour, setUse24Hour] = useState(() => {
    const saved = localStorage.getItem("world-clock-24h");
    return saved !== null ? saved === "true" : true;
  });
  const [sliderOffset, setSliderOffset] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_tick, setTick] = useState(0);

  // Save preferences
  useEffect(() => {
    localStorage.setItem("world-clock-cities", JSON.stringify(cities));
  }, [cities]);

  useEffect(() => {
    localStorage.setItem("world-clock-base", String(baseIndex));
  }, [baseIndex]);

  useEffect(() => {
    localStorage.setItem("world-clock-24h", String(use24Hour));
  }, [use24Hour]);

  // Live timer — update every 1s for UI (only runs when popover is visible)
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync tray config to Rust backend
  useEffect(() => {
    const base = cities[baseIndex];
    if (!base) return;
    invoke("update_tray_config", {
      timezone: base.timezone,
      flag: base.flag,
      use24h: use24Hour,
    }).catch(() => {});
  }, [baseIndex, cities, use24Hour]);

  const resetToNow = useCallback(() => {
    setSliderOffset(0);
  }, []);

  const setBase = useCallback((index: number) => {
    setBaseIndex(index);
  }, []);

  const addCity = useCallback((city: City) => {
    setCities((prev) => {
      if (prev.some((c) => c.timezone === city.timezone)) return prev;
      return [...prev, city];
    });
  }, []);

  const removeCity = useCallback((timezone: string) => {
    setCities((prev) => {
      const next = prev.filter((c) => c.timezone !== timezone);
      return next.length > 0 ? next : prev;
    });
    setBaseIndex((prev) => {
      const newCities = cities.filter((c) => c.timezone !== timezone);
      return prev >= newCities.length ? 0 : prev;
    });
  }, [cities]);

  const effectiveDate = dateWithOffset(sliderOffset);

  return {
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
  };
}
