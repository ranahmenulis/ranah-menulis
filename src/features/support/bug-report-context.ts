import type { BugContext } from "./bug-report-model";

/** A short, language-neutral description of the browser and system: "Chrome · Windows". */
export function browserBrief(userAgent: string): string {
  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /OPR\//.test(userAgent)
      ? "Opera"
      : /Firefox\//.test(userAgent)
        ? "Firefox"
        : /Chrome\/|CriOS\//.test(userAgent)
          ? "Chrome"
          : /Safari\//.test(userAgent)
            ? "Safari"
            : "";
  const system = /Android/.test(userAgent)
    ? "Android"
    : /iPhone|iPad|iPod/.test(userAgent)
      ? "iOS"
      : /Windows/.test(userAgent)
        ? "Windows"
        : /Mac OS X/.test(userAgent)
          ? "macOS"
          : /Linux/.test(userAgent)
            ? "Linux"
            : "";
  return [browser, system].filter(Boolean).join(" · ");
}

/** Builds the technical info of a report from plain values (kept pure so it can be tested). */
export function buildContext(env: {
  path: string;
  language: string;
  theme: string;
  width: number;
  height: number;
  userAgent: string;
}): BugContext {
  // The address only: a query or fragment could carry something the reporter did not mean to send.
  const path = env.path.split(/[?#]/)[0] || "/";
  return {
    path,
    language: env.language,
    theme: env.theme,
    screen: `${Math.round(env.width)} × ${Math.round(env.height)}`,
    browser: browserBrief(env.userAgent),
  };
}

/** Reads the values from the page. Browser only. */
export function readContext(path: string, language: string): BugContext {
  const root = document.documentElement;
  const dark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  return buildContext({
    path,
    language,
    theme: root.dataset.theme ?? (dark ? "dark" : "light"),
    width: window.innerWidth,
    height: window.innerHeight,
    userAgent: navigator.userAgent,
  });
}
