/** Without a saved choice the page follows the system (media query in globals.css). */
export const THEMES = ["light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_COOKIE = "theme";
const MAX_AGE = 60 * 60 * 24 * 365;

export function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && (THEMES as readonly string[]).includes(value);
}

export function nextTheme(theme: Theme): Theme {
  return theme === "light" ? "dark" : "light";
}

/** The saved choice, or null when the person never chose (then the system decides). */
export function readTheme(cookie: string): Theme | null {
  const match = cookie.match(new RegExp(`(?:^|; )${THEME_COOKIE}=([^;]*)`));
  return match && isTheme(match[1]) ? match[1] : null;
}

/** Browser chrome colour per theme: the same value as --canvas in globals.css. */
export const THEME_COLORS: Record<Theme, string> = { light: "#ffffff", dark: "#121212" };

const COLOR_META = "data-theme-color";

export function applyTheme(theme: Theme, root: HTMLElement = document.documentElement): void {
  root.setAttribute("data-theme", theme);
  // The browser's status bar colour comes from one meta of our own (not Next's `themeColor`,
  // which renders a pair that only follows the system and is re-inserted by Next). The head script
  // creates it before paint; this keeps it in step when the person picks a theme.
  const doc = root.ownerDocument;
  let meta = doc.head.querySelector(`meta[${COLOR_META}]`);
  if (!meta) {
    meta = doc.createElement("meta");
    meta.setAttribute("name", "theme-color");
    meta.setAttribute(COLOR_META, "");
    doc.head.append(meta);
  }
  meta.setAttribute("content", THEME_COLORS[theme]);
}

export type RevealOrigin = { x: number; y: number };

const REVEAL_MS = 500;

/** Centre of an element, in viewport coordinates: where the reveal circle starts. */
export function originOf(element: Element): RevealOrigin {
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function commit(theme: Theme): void {
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=${MAX_AGE}; samesite=lax`;
  applyTheme(theme);
  window.dispatchEvent(new Event(THEME_EVENT));
}

/**
 * Saves and applies the theme. With an origin, the new theme is revealed as a circle growing from
 * that point (View Transitions API). Without support, or with reduced motion, it switches at once.
 */
export function saveTheme(theme: Theme, origin?: RevealOrigin): void {
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  if (!origin || reduced || typeof document.startViewTransition !== "function") {
    commit(theme);
    return;
  }

  const radius = Math.hypot(
    Math.max(origin.x, window.innerWidth - origin.x),
    Math.max(origin.y, window.innerHeight - origin.y),
  );
  const transition = document.startViewTransition(() => commit(theme));
  transition.ready
    .then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${origin.x}px ${origin.y}px)`,
            `circle(${radius}px at ${origin.x}px ${origin.y}px)`,
          ],
        },
        {
          duration: REVEAL_MS,
          easing: "cubic-bezier(0.23, 1, 0.32, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    })
    .catch(() => {});
}

export const THEME_EVENT = "ranah-theme-change";

/** Runs in <head> before first paint so the page never flashes the wrong theme. */
export const themeScript = `(function(){try{var d=document,r=d.documentElement,c=${JSON.stringify(THEME_COLORS)},m=d.cookie.match(/(?:^|; )${THEME_COOKIE}=(light|dark)/);if(m)r.setAttribute("data-theme",m[1]);var q=window.matchMedia&&matchMedia("(prefers-color-scheme: dark)"),e=d.createElement("meta");e.setAttribute("name","theme-color");e.setAttribute("${COLOR_META}","");function s(){e.setAttribute("content",c[r.getAttribute("data-theme")||(q&&q.matches?"dark":"light")])}s();d.head.append(e);if(q&&q.addEventListener)q.addEventListener("change",s)}catch(x){}})();`;
