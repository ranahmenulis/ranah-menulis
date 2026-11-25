"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/lib/auth/session-context";
import { notifyDocumentListChanged } from "../storage/document-events";
import {
  importFromDevice,
  pendingImport,
  type ImportSummary,
} from "../storage/remote/import-local";
import { accountSession, deviceStore } from "../storage/store";

const DISMISSED_KEY = "ranah.deviceImportDismissed";

function readDismissed(userId: string): boolean {
  try {
    return window.localStorage.getItem(`${DISMISSED_KEY}.${userId}`) === "1";
  } catch {
    return false;
  }
}

function writeDismissed(userId: string, dismissed: boolean) {
  try {
    if (dismissed) window.localStorage.setItem(`${DISMISSED_KEY}.${userId}`, "1");
    else window.localStorage.removeItem(`${DISMISSED_KEY}.${userId}`);
  } catch {
    // Without storage the choice only lasts until the page is left.
  }
}

export type DeviceImportState =
  | { phase: "idle" }
  | { phase: "ready"; count: number; dismissed: boolean }
  | { phase: "running"; count: number }
  | { phase: "done"; summary: ImportSummary; left: number }
  | { phase: "error"; count: number };

/**
 * Offers to copy what this device holds into the signed-in account. Idle for visitors and when
 * nothing is waiting. The count is read in an effect (never while rendering) and is "what the
 * account does not have yet", so a person who already wrote in the account can still import the rest.
 */
export function useDeviceImport() {
  const session = useSession();
  const userId = session?.status === "user" ? session.userId : null;
  const [state, setState] = useState<DeviceImportState>({ phase: "idle" });

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    void (async () => {
      try {
        const live = await accountSession();
        if (!live || cancelled) return;
        const waiting = await pendingImport(deviceStore(), live.store);
        const count = waiting.documents + waiting.folders;
        if (cancelled) return;
        setState(
          count > 0
            ? { phase: "ready", count, dismissed: readDismissed(userId) }
            : { phase: "idle" },
        );
      } catch {
        // A failed look is the same as nothing to offer: the device keeps its data.
        if (!cancelled) setState({ phase: "idle" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const setDismissed = useCallback(
    (dismissed: boolean) => {
      if (!userId) return;
      writeDismissed(userId, dismissed);
      setState((current) =>
        current.phase === "ready" || current.phase === "error"
          ? { phase: "ready", count: current.count, dismissed }
          : current,
      );
    },
    [userId],
  );

  const run = useCallback(async () => {
    if (!userId) return;
    const count = state.phase === "ready" || state.phase === "error" ? state.count : 0;
    setState({ phase: "running", count });
    try {
      const live = await accountSession();
      if (!live) throw new Error("signed out");
      const summary = await importFromDevice(deviceStore(), live.store, live.client);
      const waiting = await pendingImport(deviceStore(), live.store);
      const left = waiting.documents + waiting.folders;
      // What the database refused stays on the device; keep the link quiet instead of nagging.
      if (left > 0) writeDismissed(userId, true);
      notifyDocumentListChanged();
      setState({ phase: "done", summary, left });
    } catch {
      setState({ phase: "error", count });
    }
  }, [state, userId]);

  const close = useCallback(() => {
    setState((current) => {
      if (current.phase !== "done" || current.left === 0) return { phase: "idle" };
      return { phase: "ready", count: current.left, dismissed: true };
    });
  }, []);

  return { state, run, setDismissed, close };
}
