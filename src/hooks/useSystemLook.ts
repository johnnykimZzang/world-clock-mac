import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

interface SystemLook {
  /** macOS accent color as #rrggbb, null when it can't be read */
  accent: string | null;
  /** Native backdrop behind the webview: Liquid Glass (macOS 26+) or vibrancy */
  material: "liquid" | "vibrancy";
}

/**
 * Mirror the macOS accent color and glass material into CSS. Light/dark comes
 * from `prefers-color-scheme`, which WKWebView already ties to the system.
 */
export function useSystemLook() {
  useEffect(() => {
    const root = document.documentElement;
    const refresh = () =>
      invoke<SystemLook>("system_look")
        .then(({ accent, material }) => {
          if (accent) root.style.setProperty("--accent", accent);
          else root.style.removeProperty("--accent");
          root.classList.toggle("glass-liquid", material === "liquid");
          root.classList.toggle("glass-vibrancy", material === "vibrancy");
        })
        .catch(() => {}); // browser preview: keep CSS defaults

    refresh();
    // Users may change the accent while the popover is hidden
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);
}
