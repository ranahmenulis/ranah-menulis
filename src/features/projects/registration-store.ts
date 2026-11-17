"use client";

import { useSyncExternalStore } from "react";
import { confirmPayment, isExpired } from "./payment-model";
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
  if (cache?.raw !== raw) cache = { raw, map: parseRegistrations(raw) };
  return cache.map;
}

/** The registrations now, outside React (button handlers read again at the moment of the click). */
export const readRegistrations = (): RegistrationMap => registrationsFor(snapshot());

/**
 * Saves one registration. A project is registered once: a second call for the same project (a
 * second tab, a repeated submit) keeps the first and changes nothing. The one exception is a
 * registration whose payment hold ran out: it is replaced, so the reader can try again [usulan].
 * Cancelling is a separate step (PRJ-06, free projects only) and does not exist yet.
 */
export function saveRegistration(registration: Registration) {
  const current = parseRegistrations(snapshot());
  const existing = current[registration.slug];
  if (existing && !isExpired(existing, registration.registeredAt)) return;
  write({ ...current, [registration.slug]: registration });
}

/**
 * Payment arrived (the QRIS webhook will call this, an Organizer panel later; today a development
 * panel). Returns whether anything changed: false when there is no such registration, it is
 * already paid, or its hold ran out.
 */
export function settlePayment(slug: string, now: number): boolean {
  const current = parseRegistrations(snapshot());
  const registration = current[slug];
  const paid = registration ? confirmPayment(registration, now) : null;
  if (!paid) return false;
  write({ ...current, [slug]: paid });
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
