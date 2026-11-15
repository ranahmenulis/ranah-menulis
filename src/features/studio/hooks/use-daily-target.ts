"use client";

import { useSyncExternalStore } from "react";
import { dayKey } from "../daily-progress";
import { targetFor } from "../streak";
import { DEFAULT_TARGET, readTargets } from "../target-setting";

const subscribe = (callback: () => void) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

/** Today's target for the editor indicator; falls back to the default when none was set. */
export function useDailyTarget(): number {
  return useSyncExternalStore(
    subscribe,
    () => targetFor(readTargets(window.localStorage), dayKey(new Date())) ?? DEFAULT_TARGET,
    () => DEFAULT_TARGET,
  );
}
