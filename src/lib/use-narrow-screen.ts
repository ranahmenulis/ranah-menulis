"use client";

import { useSyncExternalStore } from "react";

/** Below md (768px), where floating panels become bottom sheets. */
const NARROW = "(max-width: 767.98px)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia?.(NARROW);
  media?.addEventListener("change", onChange);
  return () => media?.removeEventListener("change", onChange);
}

/**
 * True on a narrow screen. False on the server and where `matchMedia` is missing (tests), so the
 * first render always matches the server's.
 */
export function useNarrowScreen(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia?.(NARROW).matches ?? false,
    () => false,
  );
}
