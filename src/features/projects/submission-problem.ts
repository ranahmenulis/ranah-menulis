import type { Locale } from "@/lib/i18n/config";
import { formatNumber } from "@/lib/i18n/format";
import { fill } from "@/features/studio/copy/fill";
import { flowCopy } from "./copy/flow";

export type ProblemField =
  "doc" | "title" | "genre" | "note" | "synopsis" | "agreed" | "closed" | "limit";

/** Keys of the `problems` section of the participant-flow dictionary. */
export type ProblemCode = keyof ReturnType<typeof flowCopy>["problems"];

/**
 * One reason a submission or revision cannot be sent. `code` and `values` let a screen show it in
 * the interface language; `message` is the Indonesian sentence, kept for callers that read it.
 */
export type Problem = {
  field: ProblemField;
  message: string;
  code: ProblemCode;
  values?: Record<string, string | number>;
};

/** The sentence for a problem in the given language; numbers follow the language's format. */
export function renderProblem(problem: Pick<Problem, "code" | "values">, locale: Locale): string {
  const values = Object.fromEntries(
    Object.entries(problem.values ?? {}).map(([key, value]) => [
      key,
      typeof value === "number" ? formatNumber(value, locale) : value,
    ]),
  );
  return fill(flowCopy(locale).problems[problem.code], values);
}

export function makeProblem(
  field: ProblemField,
  code: ProblemCode,
  values?: Record<string, string | number>,
): Problem {
  return { field, code, values, message: renderProblem({ code, values }, "id") };
}

/** The same problem with its message in the given language. */
export const localizeProblem = (problem: Problem, locale: Locale): Problem => ({
  ...problem,
  message: renderProblem(problem, locale),
});
