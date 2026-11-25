"use client";

import { useMemo, useSyncExternalStore } from "react";
import { readSessionNow, useSession } from "./auth/session-context";
import { NO_ROLES, parseRoles, type ManagerRole } from "./roles";

/**
 * Who is looking. The app always has a session (`AuthProvider`), which decides everything. Without
 * one (component tests render screens alone) the viewer and the management roles come from
 * `sessionStorage`, which tests set directly. Outside tests that fallback is switched off.
 */
export type Viewer = "masuk" | "tamu";

const KEY = "rm-viewer";
const ROLES_KEY = "rm-roles";
const EVENT = "rm-viewer-change";
const enabled = process.env.NODE_ENV === "test";

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

const fromSession = (status: "guest" | "user"): Viewer => (status === "user" ? "masuk" : "tamu");

export function useViewer(): Viewer {
  const session = useSession();
  const local = useSyncExternalStore(subscribe, read, () => "masuk" as Viewer);
  // With a real session the server's answer wins.
  return session ? fromSession(session.status) : local;
}

/** Management roles (test fallback only); empty for the signed-out view. */
export function useRoles(): readonly ManagerRole[] {
  const raw = useSyncExternalStore(subscribe, readRoles, () => "");
  const viewer = useViewer();
  return useMemo(() => (viewer === "tamu" ? NO_ROLES : parseRoles(raw)), [raw, viewer]);
}

/** The viewer and the roles right now, for button handlers. */
export function readViewerNow(): { viewer: Viewer; roles: readonly ManagerRole[] } {
  const session = readSessionNow();
  const viewer = session ? fromSession(session.status) : read();
  return { viewer, roles: viewer === "tamu" ? NO_ROLES : parseRoles(readRoles()) };
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

/** Test stand-in for signing in and out (the in-memory gateway calls it); a no-op elsewhere. */
export function setViewer(next: Viewer) {
  if (!enabled) return;
  if (!store(next, null)) return;
  window.dispatchEvent(new Event(EVENT));
}
