export const THEMES = ["system", "light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_COOKIE = "theme";
const MAX_AGE = 60 * 60 * 24 * 365;

export function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && (THEMES as readonly string[]).includes(value);
}

/** Next mode in the cycle system → light → dark → system. */
export function nextTheme(theme: Theme): Theme {
  return THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
}

export function readTheme(cookie: string): Theme {
  const match = cookie.match(new RegExp(`(?:^|; )${THEME_COOKIE}=([^;]*)`));
  return match && isTheme(match[1]) ? match[1] : "system";
}

/** `system` removes the attribute so the media query in globals.css decides. */
export function applyTheme(theme: Theme, root: HTMLElement = document.documentElement): void {
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
}

export function saveTheme(theme: Theme): void {
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=${MAX_AGE}; samesite=lax`;
  applyTheme(theme);
  window.dispatchEvent(new Event(THEME_EVENT));
}

export const THEME_EVENT = "ranah-theme-change";

/** Runs in <head> before first paint so the page never flashes the wrong theme. */
export const themeScript = `(function(){try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=(light|dark)/);if(m)document.documentElement.setAttribute("data-theme",m[1])}catch(e){}})();`;
