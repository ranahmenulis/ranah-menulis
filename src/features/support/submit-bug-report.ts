import { ME_ID } from "@/features/kelola/identity";
import { bugReports } from "./bug-report-store";
import {
  validateBugReport,
  type BugCategory,
  type BugContext,
  type BugProblems,
} from "./bug-report-model";

export type SubmitBugResult = { ok: true; id: string } | { ok: false; problems: BugProblems };

/**
 * Stores a report. The text is checked again here, not only in the form. The reporter is the
 * signed-in account and is shown to Administrators so they can follow up (the form says so).
 */
export function submitBugReport(
  input: { category: string; description: string; steps: string; context: BugContext | null },
  reporterId = ME_ID,
  at = Date.now(),
): SubmitBugResult {
  const problems = validateBugReport(input);
  if (Object.keys(problems).length > 0) return { ok: false, problems };
  const all = bugReports.read();
  const steps = input.steps.trim();
  const id = `bug-${at}-${all.length}`;
  bugReports.write([
    ...all,
    {
      id,
      category: input.category as BugCategory,
      description: input.description.trim(),
      ...(steps ? { steps } : {}),
      ...(input.context ? { context: input.context } : {}),
      reporterId,
      at,
    },
  ]);
  return { ok: true, id };
}
