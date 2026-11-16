"use client";

import { useSyncExternalStore } from "react";
import type { Registration, RegistrationMap } from "./types";

const KEY = "ranah.registrations";

const listeners = new Set<() => void>();

/** Only set when localStorage refused a write, so the screen still reflects what was saved. */
let fallback: string | null = null;

function snapshot(): string | null {
  try {
    return window.localStorage.getItem(KEY) ?? fallback;
  } catch {
    return fallback;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
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
  if (cache?.raw !== raw) cache = { raw, map: parseRegistrations(raw) };
  return cache.map;
}

/**
 * Saves one registration. A project is registered once: a second call for the same project (a
 * second tab, a repeated submit) keeps the first and changes nothing. There is no way to cancel,
 * the PRD defines none and refunds are undecided (BR-PRJ-11, Q-30).
 */
export function saveRegistration(registration: Registration) {
  const current = parseRegistrations(snapshot());
  if (current[registration.slug]) return;
  write({ ...current, [registration.slug]: registration });
}

/**
 * Turns a registration that waits for payment into a confirmed one. Payment does not exist yet
 * (6f-6), so for now only a development-only button calls it; QRIS confirmation will call it later.
 * Does nothing when there is no such registration or it is already confirmed.
 */
export function confirmRegistration(slug: string) {
  const current = parseRegistrations(snapshot());
  const registration = current[slug];
  if (!registration || registration.status === "terdaftar") return;
  write({ ...current, [slug]: { ...registration, status: "terdaftar" } });
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
