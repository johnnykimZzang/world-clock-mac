import { useEffect, type RefObject } from "react";
import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";

/** Space kept free below the popover: menu bar, gap under the tray icon, screen margin */
const SCREEN_RESERVE = 40;

/**
 * Resize the native popover window to the height of its content, so there is
 * no empty glass below the last tile. The content is capped at the screen
 * height (`--max-h`) and scrolls beyond that.
 */
export function useFitWindow(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !("__TAURI_INTERNALS__" in window)) return;

    document.documentElement.style.setProperty("--max-h", `${window.screen.availHeight - SCREEN_RESERVE}px`);
    const win = getCurrentWindow();
    let last = 0;
    const observer = new ResizeObserver(() => {
      const height = Math.ceil(el.getBoundingClientRect().height);
      if (!height || height === last) return;
      last = height;
      win.setSize(new LogicalSize(window.innerWidth, height)).catch(() => {});
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
}
