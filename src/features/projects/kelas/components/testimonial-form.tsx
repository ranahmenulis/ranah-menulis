"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckChoice } from "@/components/ui/choice";
import { Field, Textarea, describedBy } from "@/components/ui/field";
import { fill } from "@/features/studio/copy/fill";
import { useT } from "@/lib/i18n/provider";
import { useFormat } from "@/lib/i18n/use-format";
import { saveTestimonial } from "../testimonial-actions";
import type { AssignmentStore } from "../storage/assignment-store";
import { TESTIMONIAL_LIMIT, testimonialCodeText, type Testimonial } from "../testimonial-model";

/**
 * Writes or changes the reader's testimonial (KLS-07). Showing their name is a choice that starts
 * off: it is never ticked for them. A refusal keeps what they typed and says why.
 */
export function TestimonialForm({
  slug,
  initial,
  onDone,
  onCancel,
  store,
}: {
  slug: string;
  initial?: Testimonial;
  onDone: (message: string) => void;
  onCancel?: () => void;
  store?: AssignmentStore;
}) {
  const t = useT().projectsClass.testimonial.form;
  const { locale } = useFormat();
  const id = useId();
  const [text, setText] = useState(initial?.text ?? "");
  const [showName, setShowName] = useState(initial?.showName ?? false);
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const length = [...text].length;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const result = await saveTestimonial({ slug, text, showName }, Date.now(), store);
    setBusy(false);
    if (result.ok) onDone(testimonialCodeText(result.code, locale));
    else setError(testimonialCodeText(result.code, locale));
  }

  return (
    <form noValidate onSubmit={submit} className="grid gap-3">
      <Field
        id={id}
        label={t.label}
        hint={fill(t.hint, { length: String(length), limit: String(TESTIMONIAL_LIMIT) })}
        error={error}
      >
        <Textarea
          id={id}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError(undefined);
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, { hint: true, error })}
        />
      </Field>
      <CheckChoice
        checked={showName}
        onChange={(e) => setShowName(e.target.checked)}
        label={t.showName}
        hint={t.showNameHint}
      />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="secondary" loading={busy}>
          {initial ? t.save : t.send}
        </Button>
        {onCancel && (
          <Button type="button" variant="text" onClick={onCancel} disabled={busy}>
            {t.cancel}
          </Button>
        )}
      </div>
    </form>
  );
}
