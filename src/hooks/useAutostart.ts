import { useState, useEffect, useCallback } from "react";
import { enable, disable, isEnabled } from "@tauri-apps/plugin-autostart";

/** Launch-at-login state, backed by a macOS LaunchAgent (tauri-plugin-autostart). */
export function useAutostart() {
  const [enabled, setEnabled] = useState(false);
  const [available, setAvailable] = useState(true);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    isEnabled()
      .then(setEnabled)
      .catch(() => setAvailable(false)); // not running inside Tauri
  }, []);

  const toggle = useCallback(async () => {
    setPending(true);
    try {
      if (enabled) await disable();
      else await enable();
      setEnabled(await isEnabled());
    } catch { /* keep previous state */ }
    setPending(false);
  }, [enabled]);

  return { enabled, available, pending, toggle };
}
