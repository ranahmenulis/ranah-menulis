"use client";

import { useCallback, useEffect, useState } from "react";
import { onAssignmentsChanged } from "../storage/assignment-events";
import type { AssignmentStore } from "../storage/assignment-store";
import { assignmentStore } from "../storage/store";
import type { AssignmentSubmission } from "../types";

export type AssignmentsData = {
  status: "loading" | "ready" | "error";
  /** Newest first. */
  submissions: AssignmentSubmission[];
  reload: () => void;
};

/**
 * Assignments handed in on this device. Reads on mount and again whenever one changes. A failed
 * read is an error state with a retry, never an empty list that could be mistaken for "nothing
 * handed in yet".
 */
export function useAssignments(store: AssignmentStore = assignmentStore): AssignmentsData {
  const [state, setState] = useState<Pick<AssignmentsData, "status" | "submissions">>({
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
    const stop = onAssignmentsChanged(load);
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
