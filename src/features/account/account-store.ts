"use client";

import { useContext, useMemo, useSyncExternalStore } from "react";
import { mergeAccount, parseAccount, type Account, type AccountPatch } from "./account-model";
import { LiveAccountContext } from "./live-account-context";

// The shape and the pure helpers live in `account-model.ts`; they are re-exported so the screens
// keep importing from here.
export {
  DEFAULT_ACCOUNT,
  mergeAccount,
  parseAccount,
  type Account,
  type AccountPatch,
  type AccountPrefs,
  type AccountProfile,
} from "./account-model";

const KEY = "ranah.account";

const listeners = new Set<() => void>();

/** Only set when localStorage refused a write, so this tab still shows what was saved. */
let fallback: string | null = null;

function snapshot(): string | null {
  try {
    return fallback ?? window.localStorage.getItem(KEY);
  } catch {
    return fallback;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => event.key === KEY && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * The signed-in account held by `AuthProvider` (set while a user is signed in). While it is set,
 * reads and saves go to it instead of this device's storage.
 */
export type LiveAccount = {
  get(): Account;
  /** Updates the screen at once and writes the profile; false when the write was refused. */
  update(patch: AccountPatch): Promise<boolean>;
};

let live: LiveAccount | null = null;

export function connectLiveAccount(next: LiveAccount | null) {
  live = next;
}

/** The signed-in account, or the one saved on this device (the dummy reader until something is saved). */
export function readAccount(): Account {
  return live ? live.get() : parseAccount(snapshot());
}

export function useAccount(): Account {
  const signedIn = useContext(LiveAccountContext);
  const raw = useSyncExternalStore(subscribe, snapshot, () => null);
  const local = useMemo(() => parseAccount(raw), [raw]);
  return signedIn ?? local;
}

/**
 * Saves at once. On this device it returns false when the browser would not keep it (storage
 * full). For a signed-in account it only starts the write and returns true; use
 * `saveAccountAsync` where the screen must say that the write failed.
 */
export function saveAccount(patch: AccountPatch): boolean {
  if (live) {
    void live.update(patch);
    return true;
  }
  const next = JSON.stringify(mergeAccount(readAccount(), patch));
  let kept = true;
  try {
    window.localStorage.setItem(KEY, next);
    fallback = null;
  } catch {
    fallback = next;
    kept = false;
  }
  listeners.forEach((listener) => listener());
  return kept;
}

/** Like `saveAccount`, but resolves with whether the change really was kept (also by the server). */
export function saveAccountAsync(patch: AccountPatch): Promise<boolean> {
  return live ? live.update(patch) : Promise.resolve(saveAccount(patch));
}

/** Back to the dummy reader (sign-up starts a fresh account, deleting one ends it). */
export function resetAccount() {
  fallback = null;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Nothing was stored, so there is nothing to remove.
  }
  listeners.forEach((listener) => listener());
}
