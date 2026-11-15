"use client";

import { useSyncExternalStore } from "react";
import { isTheme, saveTheme, THEME_EVENT, type Theme } from "./theme";

function subscribe(callback: () => void) {
  window.addEventListener(THEME_EVENT, callback);
  return () => window.removeEventListener(THEME_EVENT, callback);
}

function getSnapshot(): Theme {
  const value = document.documentElement.getAttribute("data-theme");
  return isTheme(value) ? value : "system";
}

/** Current theme (from the data-theme attribute) and a setter that also saves the cookie. */
export function useTheme(): [Theme, (next: Theme) => void] {
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => "system" as const);
  return [theme, saveTheme];
}
