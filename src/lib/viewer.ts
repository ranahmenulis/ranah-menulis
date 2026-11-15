"use client";

import { useEffect, useSyncExternalStore } from "react";

/**
 * Who is looking while sign-in is bypassed. Always "masuk" (the dummy user) except in development
 * and tests, where `?sebagai=tamu` switches the tab to the signed-out view and `?sebagai=masuk`
 * switches back. Removed together with the bypass when real auth arrives.
 */
export type Viewer = "masuk" | "tamu";

const KEY = "rm-viewer";
const EVENT = "rm-viewer-change";
const enabled = process.env.NODE_ENV !== "production";

function read(): Viewer {
  if (!enabled) return "masuk";
  try {
    return sessionStorage.getItem(KEY) === "tamu" ? "tamu" : "masuk";
  } catch {
    return "masuk";
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}

export function useViewer(): Viewer {
  return useSyncExternalStore(subscribe, read, () => "masuk");
}

/** Reads `?sebagai=` from the address and keeps it for the tab. Renders nothing. */
export function ViewerSync({ pathname }: { pathname: string }) {
  useEffect(() => {
    if (!enabled) return;
    const asked = new URLSearchParams(window.location.search).get("sebagai");
    if (asked !== "tamu" && asked !== "masuk") return;
    try {
      sessionStorage.setItem(KEY, asked);
    } catch {
      return;
    }
    window.dispatchEvent(new Event(EVENT));
  }, [pathname]);
  return null;
}
