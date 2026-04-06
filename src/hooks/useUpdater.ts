import { useState, useEffect } from "react";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

interface UpdateInfo {
  version: string;
  body: string;
}

export function useUpdater() {
  const [update, setUpdate] = useState<UpdateInfo | null>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    checkForUpdate();
  }, []);

  async function checkForUpdate() {
    try {
      const result = await check();
      if (result?.available) {
        setUpdate({
          version: result.version,
          body: result.body ?? "",
        });
      }
    } catch {
      // Silently fail — update check is non-critical
    }
  }

  async function installUpdate() {
    if (!update) return;
    try {
      setInstalling(true);
      const result = await check();
      if (result?.available) {
        await result.downloadAndInstall();
        await relaunch();
      }
    } catch {
      setInstalling(false);
    }
  }

  return { update, installing, installUpdate, checkForUpdate };
}
