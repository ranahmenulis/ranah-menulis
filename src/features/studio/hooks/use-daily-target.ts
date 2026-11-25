"use client";

import { useSyncExternalStore } from "react";
import { useAccount } from "@/features/account/account-store";
import { targetFor } from "../streak";
import { readTargets } from "../target-setting";
import { writingTime } from "../writing-time";

const subscribe = (callback: () => void) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

/** Today's target for the editor indicator; null when the writer has not set one (like Streak). */
export function useDailyTarget(): number | null {
  const { timeZone } = useAccount().profile;
  return useSyncExternalStore(
    subscribe,
    () => targetFor(readTargets(window.localStorage), writingTime(Date.now(), timeZone).day),
    () => null,
  );
}
