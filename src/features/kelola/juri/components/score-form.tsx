"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea, describedBy } from "@/components/ui/field";
import { Notice } from "@/components/ui/states";
import { fill } from "@/features/studio/copy/fill";
import { useFormat } from "@/lib/i18n/use-format";
import { useT } from "@/lib/i18n/provider";
import { saveJuryScore } from "../judge-actions";
import {
  NOTE_LIMIT,
  SCORE_MAX,
  SCORE_MIN,
  judgingLabel,
  scoreText,
  weightedScore,
  type Criterion,
  type JudgingStatus,
  type ScoreErrors,
} from "../judge-model";
import type { JuryScore } from "../score-store";
import { ListChecks } from "@phosphor-icons/react/dist/ssr";
import { cardClass } from "@/components/ui/card";
import { SectionIcon } from "@/components/ui/section-card";
import { cn } from "@/lib/cn";

type Props = {
  slug: string;
  submissionId: string;
  criteria: Criterion[];
  judging: JudgingStatus;
  mine: JuryScore | undefined;
};

/**
 * The scores of one work: a whole number per criterion and an optional note. Every failing rule
 * shows at its field and nothing typed is lost. Once judging is closed the fields are read-only and
 * the page says why (BR-PRJ-09); the closing is read again when the button is pressed.
 */
export function ScoreForm({ slug, submissionId, criteria, judging, mine }: Props) {
  const t = useT().kelolaJuri.form;
  const fmt = useFormat();
  const [input, setInput] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      criteria.map((c) => [c.name, mine ? String(mine.scores[c.name] ?? "") : ""]),
    ),
  );
  const [note, setNote] = useState(mine?.note ?? "");
  const [errors, setErrors] = useState<ScoreErrors>({});
  const [said, setSaid] = useState("");
  const line = useRef<HTMLParagraphElement>(null);
  const locked = judging !== "dibuka";

  function submit() {
    const result = saveJuryScore(
      { slug, submissionId, criteria },
      input,
      note,
      Date.now(),
      fmt.locale,
    );
    if (result.ok) {
      setErrors({});
      const total = weightedScore(criteria, result.score.scores);
      setSaid(
        t.saved +
          (total === null ? "" : fill(t.savedScore, { score: scoreText(total, fmt.locale) })),
      );
      return;
    }
    setSaid(result.reason === "ditutup" ? judgingLabel("ditutup", fmt.locale) : "");
    setErrors(result.errors);
    const first = [...criteria.map((c) => c.name), "note"].find((k) => result.errors[k]);
    if (first) document.getElementById(`skor-${first}`)?.focus();
    else requestAnimationFrame(() => line.current?.focus());
  }

  return (
    <form
      noValidate
      aria-label={t.aria}
      className={cn(cardClass, "grid min-w-0 gap-4")}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <h2 className="flex items-center gap-2.5 heading-md">
        <SectionIcon icon={ListChecks} />
        {t.heading}
      </h2>
      <Notice>{judgingLabel(judging, fmt.locale)}</Notice>
      {criteria.map(({ name, weight }) => {
        const id = `skor-${name}`;
        const error = errors[name];
        return (
          <Field
            key={name}
            id={id}
            label={fill(t.criterion, { name, weight: String(weight) })}
            hint={fill(t.hint, { min: String(SCORE_MIN), max: String(SCORE_MAX) })}
            error={error}
          >
            <Input
              id={id}
              inputMode="numeric"
              disabled={locked}
              value={input[name]}
              aria-invalid={error ? true : undefined}
              aria-describedby={describedBy(id, { hint: true, error })}
              onChange={(e) => setInput((prev) => ({ ...prev, [name]: e.target.value }))}
            />
          </Field>
        );
      })}
      <Field
        id="skor-note"
        label={t.note}
        optional
        hint={fill(t.noteHint, { limit: fmt.number(NOTE_LIMIT) })}
        error={errors.note}
      >
        <Textarea
          id="skor-note"
          rows={4}
          disabled={locked}
          value={note}
          aria-invalid={errors.note ? true : undefined}
          aria-describedby={describedBy("skor-note", { hint: true, error: errors.note })}
          onChange={(e) => setNote(e.target.value)}
        />
      </Field>
      <p ref={line} tabIndex={-1} role="status" className="min-h-5 text-sm outline-none">
        {said}
      </p>
      {!locked && (
        <Button type="submit" className="justify-self-start">
          {t.submit}
        </Button>
      )}
    </form>
  );
}
