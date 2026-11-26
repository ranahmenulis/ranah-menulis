"use client";

import { useContext, useSyncExternalStore } from "react";
import { useAccount } from "@/features/account/account-store";
import { LiveAccountContext } from "@/features/account/live-account-context";
import { targetFor } from "../streak";
import { readTargets } from "../target-setting";
import { writingTime } from "../writing-time";

const subscribe = (callback: () => void) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

/** Today's target for the editor indicator; null when the writer has not set one (like Streak). */
export function useDailyTarget(): number | null {
  const signedIn = useContext(LiveAccountContext);
  const account = useAccount();
  const { timeZone } = account.profile;
  return useSyncExternalStore(
    subscribe,
    () => {
      const changes = signedIn ? account.prefs.dailyTargets : readTargets(window.localStorage);
      return targetFor(changes, writingTime(Date.now(), timeZone).day);
    },
    () => null,
  );
}
