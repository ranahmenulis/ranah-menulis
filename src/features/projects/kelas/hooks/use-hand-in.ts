"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { DocumentStore } from "@/features/studio/storage/document-store";
import type { AssignmentForm } from "../assignment-model";
import { handInAssignment, resubmitAssignment, type HandInResult } from "../assignment-flow";
import type { AssignmentRow } from "../class-model";
import type { AssignmentStore } from "../storage/assignment-store";
import type { ClassContent } from "../types";

type Input = {
  content: ClassContent;
  row: AssignmentRow;
  store: AssignmentStore;
  documents: Pick<DocumentStore, "get">;
  /** The page title: focus moves here when the form disappears. */
  titleRef: RefObject<HTMLElement | null>;
};

/**
 * Handing in from the assignment page: the first hand-in or, after the mentor asked for a repair,
 * a new version. Also what the page must do around it: say what was just sent, and move focus to
 * the title when the form disappears.
 */
export function useHandIn({ content, row, store, documents, titleRef }: Input) {
  const { assignment, submission, state } = row;
  /** What was just handed in, named when the button was pressed: the status has moved on by then. */
  const [justSent, setJustSent] = useState<"tugas" | "perbaikan" | null>(null);
  const sending = useRef(false);
  const changes = submission?.statusLog.length ?? 0;

  // The form disappears once the hand-in shows, so focus would fall to the page. It moves to the
  // title as soon as the new status is on screen.
  useEffect(() => {
    if (sending.current && changes > 0) {
      sending.current = false;
      titleRef.current?.focus();
    }
  }, [changes, state, titleRef]);

  async function send(form: AssignmentForm): Promise<HandInResult> {
    // Set before writing: the new status can reach the screen before this call returns.
    sending.current = true;
    const repairing = submission !== null && state === "perlu-perbaikan";
    const result = repairing
      ? await resubmitAssignment({ submissionId: submission.id, form, documents, store })
      : await handInAssignment({ content, assignmentId: assignment.id, form, documents, store });
    if (result.kind === "sent") setJustSent(repairing ? "perbaikan" : "tugas");
    else sending.current = false;
    return result;
  }

  return { justSent, send };
}
