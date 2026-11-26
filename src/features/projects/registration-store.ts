"use client";

import { useSyncExternalStore } from "react";
import { cancellationLog } from "./cancellation-log";
import { confirmPayment, isExpired } from "./payment-model";
import {
  deleteRemoteRegistration,
  loadRemoteRegistrations,
  saveRemoteRegistration,
} from "./storage/remote/remote-project-maps";
import type { Registration, RegistrationMap } from "./types";

const KEY = "ranah.registrations";

const listeners = new Set<() => void>();

/** Only set when localStorage refused a write, so the screen still reflects what was saved. */
let fallback: string | null = null;
let remoteMap: RegistrationMap | null = null;
let loadedRemote = false;

function ensureRemote() {
  if (loadedRemote) return;
  loadedRemote = true;
  void loadRemoteRegistrations()
    .then((map) => {
      if (map === null) return;
      remoteMap = map;
      listeners.forEach((l) => l());
    })
    .catch(() => {
      loadedRemote = false;
    });
}

function snapshot(): string | null {
  try {
    return window.localStorage.getItem(KEY) ?? fallback;
  } catch {
    return fallback;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  ensureRemote();
  // Another tab registered.
  // A null key means the whole storage was cleared.
  const onStorage = (e: StorageEvent) => (e.key === KEY || e.key === null) && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function isRegistration(value: unknown, key: string): value is Registration {
  if (typeof value !== "object" || value === null) return false;
  const r = value as Record<string, unknown>;
  return (
    r.slug === key &&
    Number.isFinite(r.registeredAt) &&
    Number.isFinite(r.agreedAt) &&
    typeof r.termsVersion === "string" &&
    (r.paidAt === undefined || Number.isFinite(r.paidAt)) &&
    (r.status === "terdaftar" || r.status === "menunggu-pembayaran")
  );
}

/** Anything that is not a well-formed record is dropped, so old or edited data cannot break a page. */
export function parseRegistrations(raw: string | null): RegistrationMap {
  try {
    const parsed = raw ? (JSON.parse(raw) as unknown) : {};
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
    const result: RegistrationMap = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (!isRegistration(value, key)) continue;
      result[key] = {
        ...value,
        packageName: typeof value.packageName === "string" ? value.packageName : undefined,
      };
    }
    return result;
  } catch {
    return {};
  }
}

/**
 * Registrations made on this device, by project slug. Empty on the server and during hydration.
 * Dummy persistence until the backend exists: nothing leaves the browser, and it is not shared
 * between devices or people.
 */
export function useRegistrations(): RegistrationMap {
  return registrationsFor(useSyncExternalStore(subscribe, snapshot, () => null));
}

/** Parsed once per stored value, so every screen on the page shares one map. */
let cache: { raw: string | null; map: RegistrationMap } | null = null;
function registrationsFor(raw: string | null): RegistrationMap {
  if (remoteMap !== null) return remoteMap;
  if (cache?.raw !== raw) cache = { raw, map: parseRegistrations(raw) };
  return cache.map;
}

/** The registrations now, outside React (button handlers read again at the moment of the click). */
export const readRegistrations = (): RegistrationMap => registrationsFor(snapshot());

export function saveRegistration(registration: Registration) {
  const current = remoteMap ?? parseRegistrations(snapshot());
  const existing = current[registration.slug];
  if (existing && !isExpired(existing, registration.registeredAt)) return;
  const next = { ...current, [registration.slug]: registration };
  if (remoteMap !== null) {
    remoteMap = next;
    listeners.forEach((l) => l());
    void saveRemoteRegistration(registration).catch(() => undefined);
    return;
  }
  write(next);
}

export function settlePayment(
  slug: string,
  now: number,
  by: Registration["paidBy"] = "sistem",
): boolean {
  const current = remoteMap ?? parseRegistrations(snapshot());
  const registration = current[slug];
  const paid = registration ? confirmPayment(registration, now, by) : null;
  if (!paid) return false;
  const next = { ...current, [slug]: paid };
  if (remoteMap !== null) {
    remoteMap = next;
    listeners.forEach((l) => l());
    // "sistem" settlements are persisted server-side (webhook/polling); client RLS blocks self-settling.
    if (by !== "sistem") void saveRemoteRegistration(paid).catch(() => undefined);
    return true;
  }
  write(next);
  return true;
}

export function cancelRegistration(slug: string, now: number): boolean {
  const current = remoteMap ?? parseRegistrations(snapshot());
  const registration = current[slug];
  if (!registration) return false;
  cancellationLog.write([
    ...cancellationLog.read(),
    {
      slug,
      registeredAt: registration.registeredAt,
      cancelledAt: now,
      packageName: registration.packageName,
    },
  ]);
  const { [slug]: _removed, ...rest } = current;
  void _removed;
  if (remoteMap !== null) {
    remoteMap = rest;
    listeners.forEach((l) => l());
    void deleteRemoteRegistration(slug).catch(() => undefined);
    return true;
  }
  write(rest);
  return true;
}

function write(map: RegistrationMap) {
  const next = JSON.stringify(map);
  try {
    window.localStorage.setItem(KEY, next);
    fallback = null;
  } catch {
    fallback = next; // Private mode or storage full: kept for this tab only.
  }
  listeners.forEach((listener) => listener());
}
