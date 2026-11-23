import type { Locale } from "@/lib/i18n/config";
import { fill } from "@/features/studio/copy/fill";
import { organizerCopy } from "./copy/organizer-copy";
import type { ProjectInput } from "./project-input";

/** Keys of the `form.problems` section of the Organizer dictionary. */
export type ProblemCode = keyof ReturnType<typeof organizerCopy>["form"]["problems"];

/** A failing rule in language-neutral form: a stable code plus the numbers or text it names. */
export type Problem = { code: ProblemCode; values?: Record<string, string | number> };

export type InputKey = keyof ProjectInput | "block";
export type InputProblems = Partial<Record<InputKey, Problem>>;
export type InputErrors = Partial<Record<InputKey, string>>;

/** The sentence for a problem in the given language. Values are shown as they are. */
export function renderProblem(problem: Problem, locale: Locale = "id"): string {
  const values = Object.fromEntries(
    Object.entries(problem.values ?? {}).map(([key, value]) => [key, String(value)]),
  );
  return fill(organizerCopy(locale).form.problems[problem.code], values);
}

/** Problems collected while building a project; `errors` holds the Indonesian sentences. */
export type Issues = { errors: InputErrors; problems: InputProblems };

export const newIssues = (): Issues => ({ errors: {}, problems: {} });

export function report(
  issues: Issues,
  key: InputKey,
  code: ProblemCode,
  values?: Problem["values"],
): void {
  const problem: Problem = { code, values };
  issues.problems[key] = problem;
  issues.errors[key] = renderProblem(problem, "id");
}

/** The same problems as sentences in the given language. */
export function localizeProblems(problems: InputProblems, locale: Locale): InputErrors {
  return Object.fromEntries(
    Object.entries(problems).map(([key, problem]) => [key, renderProblem(problem, locale)]),
  );
}
