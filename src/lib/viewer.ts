"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { NO_ROLES, parseRoles, type ManagerRole } from "./roles";

/**
 * Who is looking while sign-in is bypassed. Always "masuk" (the dummy user) except in development
 * and tests, where `?sebagai=tamu` switches the tab to the signed-out view, `?sebagai=masuk`
 * switches back, and `?sebagai=editor,juri` signs in holding those management roles (clearing any
 * earlier ones). Removed together with the bypass when real auth arrives.
 */
export type Viewer = "masuk" | "tamu";

const KEY = "rm-viewer";
const ROLES_KEY = "rm-roles";
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

function readRoles(): string {
  if (!enabled) return "";
  try {
    return sessionStorage.getItem(ROLES_KEY) ?? "";
  } catch {
    return "";
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}

export function useViewer(): Viewer {
  return useSyncExternalStore(subscribe, read, () => "masuk");
}

/** Management roles of the dummy user; always empty in production and for the signed-out view. */
export function useRoles(): readonly ManagerRole[] {
  const raw = useSyncExternalStore(subscribe, readRoles, () => "");
  const viewer = useViewer();
  return useMemo(() => (viewer === "tamu" ? NO_ROLES : parseRoles(raw)), [raw, viewer]);
}

function store(viewer: Viewer, roles: string | null): boolean {
  try {
    sessionStorage.setItem(KEY, viewer);
    if (roles === null) return true;
    if (roles) sessionStorage.setItem(ROLES_KEY, roles);
    else sessionStorage.removeItem(ROLES_KEY);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sign-in and sign-out screens flip the tab between the signed-in and the signed-out view. Only in
 * development and tests; production is always the dummy user while sign-in is bypassed.
 */
export function setViewer(next: Viewer) {
  if (!enabled) return;
  if (!store(next, null)) return;
  window.dispatchEvent(new Event(EVENT));
}

/** Reads `?sebagai=` from the address and keeps it for the tab. Renders nothing. */
export function ViewerSync({ pathname }: { pathname: string }) {
  useEffect(() => {
    if (!enabled) return;
    const asked = new URLSearchParams(window.location.search).get("sebagai");
    if (!asked) return;
    const roles = parseRoles(asked);
    let saved = false;
    if (asked === "tamu" || asked === "masuk") saved = store(asked, "");
    else if (roles.length > 0) saved = store("masuk", roles.join(","));
    if (saved) window.dispatchEvent(new Event(EVENT));
  }, [pathname]);
  return null;
}
