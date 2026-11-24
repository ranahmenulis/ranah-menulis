"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckChoice } from "@/components/ui/choice";
import { Dialog } from "@/components/ui/dialog";
import { Field, Select, Textarea, describedBy } from "@/components/ui/field";
import { formatNumber } from "@/lib/i18n/format";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { readContext } from "../bug-report-context";
import {
  BUG_CATEGORIES,
  DESCRIPTION_LIMIT,
  STEPS_LIMIT,
  type BugContext,
  type BugProblems,
} from "../bug-report-model";
import { submitBugReport } from "../submit-bug-report";

/**
 * "Report a problem" (client, 23 November 2026). Mounted when it opens, so each opening starts
 * empty. The technical info is read when the dialog opens, shown in full, and only sent while the
 * box stays ticked. A report with a problem keeps the dialog open and everything typed.
 */
export function ReportProblemDialog({ onClose }: { onClose: () => void }) {
  const t = useT().support.form;
  const locale = useLocale();
  const pathname = usePathname() ?? "/";
  const [context] = useState<BugContext>(() => readContext(pathname, locale));
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState("");
  const [withContext, setWithContext] = useState(true);
  const [problems, setProblems] = useState<BugProblems>({});
  const [sent, setSent] = useState(false);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const stepsRef = useRef<HTMLTextAreaElement>(null);
  const sentRef = useRef<HTMLParagraphElement>(null);

  // The confirmation replaces the form, so the focus has to follow it.
  useEffect(() => {
    if (sent) sentRef.current?.focus();
  }, [sent]);

  const limits = {
    descriptionTooLong: formatNumber(DESCRIPTION_LIMIT, locale),
    stepsTooLong: formatNumber(STEPS_LIMIT, locale),
  };
  const message = (problem: keyof typeof t.problems | undefined) =>
    problem
      ? format(t.problems[problem], {
          limit: problem === "stepsTooLong" ? limits.stepsTooLong : limits.descriptionTooLong,
        })
      : undefined;

  function submit() {
    const result = submitBugReport({
      category,
      description,
      steps,
      context: withContext ? context : null,
    });
    if (result.ok) {
      setSent(true);
      return;
    }
    setProblems(result.problems);
    const first = result.problems.category
      ? categoryRef
      : result.problems.description
        ? descriptionRef
        : stepsRef;
    first.current?.focus();
  }

  if (sent) {
    return (
      <Dialog
        open
        onClose={onClose}
        title={t.sentTitle}
        actions={<Button onClick={onClose}>{t.close}</Button>}
      >
        <p ref={sentRef} role="status" tabIndex={-1} className="text-sm text-ink outline-none">
          {t.sent}
        </p>
      </Dialog>
    );
  }

  const error = {
    category: message(problems.category),
    description: message(problems.description),
    steps: message(problems.steps),
  };
  const contextRows: [string, string][] = [
    [t.contextFields.page, context.path],
    [t.contextFields.language, context.language],
    [t.contextFields.theme, context.theme],
    [t.contextFields.screen, context.screen],
    [t.contextFields.browser, context.browser],
  ];

  return (
    <Dialog
      open
      onClose={onClose}
      title={t.title}
      description={t.intro}
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t.cancel}
          </Button>
          <Button onClick={submit}>{t.send}</Button>
        </>
      }
    >
      <div className="grid gap-4">
        <Field id="laporan-jenis" label={t.categoryLabel} error={error.category}>
          <Select
            id="laporan-jenis"
            ref={categoryRef}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-invalid={error.category ? true : undefined}
            aria-describedby={describedBy("laporan-jenis", { error: error.category })}
          >
            <option value="">{t.categoryPlaceholder}</option>
            {BUG_CATEGORIES.map((id) => (
              <option key={id} value={id}>
                {t.categories[id]}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          id="laporan-isi"
          label={t.descriptionLabel}
          hint={format(t.limit, { limit: limits.descriptionTooLong })}
          error={error.description}
        >
          <Textarea
            id="laporan-isi"
            ref={descriptionRef}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            aria-invalid={error.description ? true : undefined}
            aria-describedby={describedBy("laporan-isi", {
              hint: true,
              error: error.description,
            })}
          />
        </Field>
        <Field
          id="laporan-langkah"
          label={t.stepsLabel}
          optional
          hint={format(t.limit, { limit: limits.stepsTooLong })}
          error={error.steps}
        >
          <Textarea
            id="laporan-langkah"
            ref={stepsRef}
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            aria-invalid={error.steps ? true : undefined}
            aria-describedby={describedBy("laporan-langkah", { hint: true, error: error.steps })}
          />
        </Field>
        <CheckChoice
          label={t.contextLabel}
          hint={t.contextHint}
          checked={withContext}
          onChange={(e) => setWithContext(e.target.checked)}
        />
        {withContext && (
          <dl
            aria-label={t.contextListLabel}
            className="grid gap-1 rounded-lg bg-subtle p-3 text-xs"
          >
            {contextRows.map(([name, value]) => (
              <div key={name} className="flex flex-wrap gap-x-2">
                <dt className="text-ink-muted">{name}</dt>
                <dd className="min-w-0 wrap-anywhere text-ink">{value || "—"}</dd>
              </div>
            ))}
          </dl>
        )}
        <p className="text-xs text-ink-muted">{t.privacy}</p>
      </div>
    </Dialog>
  );
}

/** For screens that keep the open state themselves: the dialog is only mounted while it is open. */
export function ReportProblemHost({ open, onClose }: { open: boolean; onClose: () => void }) {
  return open ? <ReportProblemDialog onClose={onClose} /> : null;
}
