"use client";

import { useCallback, useState } from "react";
import type { SprintApi } from "./use-sprint";

/**
 * Open state of the sprint panel. It opens by itself the moment a sprint ends, so the result is
 * seen even when the panel was closed. Adjusting state while rendering (not in an effect) is the
 * pattern React recommends for state that follows other state.
 */
export function useSprintPanel(sprint: SprintApi) {
  const [open, setOpen] = useState(false);
  const [wasDone, setWasDone] = useState(false);
  const done = sprint.state.phase === "done";
  if (done !== wasDone) {
    setWasDone(done);
    if (done) setOpen(true);
  }
  const show = useCallback(() => setOpen(true), []);
  return { open, setOpen, show };
}
