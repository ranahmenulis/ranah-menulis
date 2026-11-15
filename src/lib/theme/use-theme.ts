"use client";

import { useSyncExternalStore } from "react";
import { isTheme, saveTheme, THEME_EVENT, type RevealOrigin, type Theme } from "./theme";

const DARK_QUERY = "(prefers-color-scheme: dark)";

function subscribe(callback: () => void) {
  const media = window.matchMedia?.(DARK_QUERY);
  window.addEventListener(THEME_EVENT, callback);
  media?.addEventListener("change", callback);
  return () => {
    window.removeEventListener(THEME_EVENT, callback);
    media?.removeEventListener("change", callback);
  };
}

/** The theme on screen: the saved choice, otherwise whatever the system uses. */
function getSnapshot(): Theme {
  const value = document.documentElement.getAttribute("data-theme");
  if (isTheme(value)) return value;
  return window.matchMedia?.(DARK_QUERY).matches ? "dark" : "light";
}

/** Theme on screen and a setter that saves the choice in a cookie. */
export function useTheme(): [Theme, (next: Theme, origin?: RevealOrigin) => void] {
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => "light" as const);
  return [theme, saveTheme];
}
