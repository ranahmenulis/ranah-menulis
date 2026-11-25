"use client";

import { useSyncExternalStore } from "react";

// The address a verification email was just sent to, kept for this tab so the Verifikasi screen can
// name it (there is no session yet, and the address does not belong in the web address).
const KEY = "ranah.pendingEmail";
const listeners = new Set<() => void>();
let fallback = "";

function snapshot(): string {
  try {
    return window.sessionStorage.getItem(KEY) ?? fallback;
  } catch {
    return fallback;
  }
}

export function rememberPendingEmail(email: string) {
  fallback = email;
  try {
    window.sessionStorage.setItem(KEY, email);
  } catch {
    // The memory copy above still serves this tab.
  }
  listeners.forEach((listener) => listener());
}

export function readPendingEmail(): string {
  return snapshot();
}

export function usePendingEmail(): string {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    snapshot,
    () => "",
  );
}
