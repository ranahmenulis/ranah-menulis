"use client";

import { useCallback, useEffect, useState } from "react";
import { onSoloChanged } from "../storage/solo-events";
import type { SoloStore } from "../storage/solo-store";
import { soloStore } from "../storage/store";
import type { SoloProgress } from "../types";

export type SoloRowsData = {
  status: "loading" | "ready" | "error";
  rows: SoloProgress[];
  reload: () => void;
};

/**
 * Solo progress on this device. Reads on mount and again whenever it changes. A failed read is an
 * error state with a retry, never an empty list that looks like "nothing happened yet".
 */
export function useSoloRows(store: SoloStore = soloStore): SoloRowsData {
  const [state, setState] = useState<Pick<SoloRowsData, "status" | "rows">>({
    status: "loading",
    rows: [],
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      store.list().then(
        (rows) => {
          if (!cancelled) setState({ status: "ready", rows });
        },
        () => {
          if (!cancelled) setState((prev) => ({ ...prev, status: "error" }));
        },
      );
    };
    load();
    const stop = onSoloChanged(load);
    return () => {
      cancelled = true;
      stop();
    };
  }, [store, attempt]);

  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, status: "loading" }));
    setAttempt((n) => n + 1);
  }, []);

  return { ...state, reload };
}
