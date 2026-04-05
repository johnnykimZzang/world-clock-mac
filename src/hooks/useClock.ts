import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { City } from "../lib/cities";
import { DEFAULT_CITIES } from "../lib/cities";
import {
  getTimeInTimezone,
  formatTime24,
  getDayState,
  getDayEmoji,
  dateWithOffset,
} from "../lib/time";

export function useClock() {
  const [cities, setCities] = useState<City[]>(() => {
    const saved = localStorage.getItem("world-clock-cities");
    return saved ? JSON.parse(saved) : DEFAULT_CITIES;
  });
  const [baseIndex, setBaseIndex] = useState(() => {
    const saved = localStorage.getItem("world-clock-base");
    return saved ? parseInt(saved) : 0;
  });
  const [sliderOffset, setSliderOffset] = useState(0); // minutes from now
  const [now, setNow] = useState(new Date());

  // Save preferences
  useEffect(() => {
    localStorage.setItem("world-clock-cities", JSON.stringify(cities));
  }, [cities]);

  useEffect(() => {
    localStorage.setItem("world-clock-base", String(baseIndex));
  }, [baseIndex]);

  // Live timer — update every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update tray title
  useEffect(() => {
    const effectiveDate = dateWithOffset(sliderOffset);
    const base = cities[baseIndex];
    if (!base) return;
    const { hour, minute } = getTimeInTimezone(base.timezone, effectiveDate);
    const state = getDayState(hour);
    const title = `${base.flag} ${formatTime24(hour, minute)} ${getDayEmoji(state)}`;
    invoke("update_tray_title", { title }).catch(() => {});
  }, [now, sliderOffset, baseIndex, cities]);

  const resetToNow = useCallback(() => {
    setSliderOffset(0);
    setNow(new Date());
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
      return next.length > 0 ? next : prev; // prevent empty
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
    setSliderOffset,
    setBase,
    resetToNow,
    addCity,
    removeCity,
  };
}
