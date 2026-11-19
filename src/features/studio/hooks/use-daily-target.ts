"use client";

import { useSyncExternalStore } from "react";
import { useAccount } from "@/features/account/account-store";
import { targetFor } from "../streak";
import { DEFAULT_TARGET, readTargets } from "../target-setting";
import { writingTime } from "../writing-time";

const subscribe = (callback: () => void) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

/** Today's target for the editor indicator; falls back to the default when none was set. */
export function useDailyTarget(): number {
  const { timeZone } = useAccount().profile;
  return useSyncExternalStore(
    subscribe,
    () =>
      targetFor(readTargets(window.localStorage), writingTime(Date.now(), timeZone).day) ??
      DEFAULT_TARGET,
    () => DEFAULT_TARGET,
  );
}
