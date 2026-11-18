"use client";

import { useCallback, useEffect, useState } from "react";
import { onSubmissionsChanged } from "./storage/submission-events";
import { submissionStore } from "./storage/store";
import type { SubmissionStore } from "./storage/submission-store";
import type { Submission } from "./submission-types";

export type SubmissionsData = {
  status: "loading" | "ready" | "error";
  /** Newest first. */
  submissions: Submission[];
  reload: () => void;
};

/**
 * Submissions made on this device. Reads on mount and again whenever one is sent. A failed read is
 * an error state with a retry, never an empty list that could be mistaken for "nothing sent".
 */
export function useSubmissions(store: SubmissionStore = submissionStore): SubmissionsData {
  const [state, setState] = useState<Pick<SubmissionsData, "status" | "submissions">>({
    status: "loading",
    submissions: [],
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let latestRead = 0;
    const load = () => {
      const read = ++latestRead;
      store.list().then(
        (list) => {
          if (cancelled || read !== latestRead) return;
          setState({
            status: "ready",
            submissions: [...list].sort((a, b) => b.submittedAt - a.submittedAt),
          });
        },
        () => {
          if (!cancelled && read === latestRead) setState((prev) => ({ ...prev, status: "error" }));
        },
      );
    };
    load();
    const stop = onSubmissionsChanged(load);
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
