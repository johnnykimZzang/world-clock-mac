import { useState, useEffect } from "react";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { listen } from "@tauri-apps/api/event";

interface UpdateInfo {
  version: string;
  body: string;
}

export function useUpdater() {
  const [update, setUpdate] = useState<UpdateInfo | null>(null);
  const [installing, setInstalling] = useState(false);
  const [upToDate, setUpToDate] = useState(false);

  useEffect(() => {
    checkSilent();
  }, []);

  // 우클릭 메뉴 "업데이트 확인" 이벤트 수신
  useEffect(() => {
    const unlistenPromise = listen("menu:check-updates", () => {
      checkManual();
    });
    return () => { unlistenPromise.then(fn => fn()); };
  }, []);

  async function checkSilent() {
    try {
      const result = await check();
      if (result?.available) {
        setUpdate({ version: result.version, body: result.body ?? "" });
      }
    } catch { /* non-critical */ }
  }

  async function checkManual() {
    try {
      const result = await check();
      if (result?.available) {
        setUpdate({ version: result.version, body: result.body ?? "" });
        setUpToDate(false);
      } else {
        setUpToDate(true);
        setTimeout(() => setUpToDate(false), 3000);
      }
    } catch { /* non-critical */ }
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

  return { update, installing, upToDate, installUpdate };
}
