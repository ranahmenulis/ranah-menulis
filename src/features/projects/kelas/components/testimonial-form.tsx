"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckChoice } from "@/components/ui/choice";
import { Field, Textarea, describedBy } from "@/components/ui/field";
import { saveTestimonial } from "../testimonial-actions";
import type { AssignmentStore } from "../storage/assignment-store";
import { TESTIMONIAL_LIMIT, type Testimonial } from "../testimonial-model";

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
    if (result.ok) onDone(result.message);
    else setError(result.message);
  }

  return (
    <form noValidate onSubmit={submit} className="grid gap-3">
      <Field
        id={id}
        label="Testimonimu"
        hint={`${length} dari ${TESTIMONIAL_LIMIT} karakter. Testimoni tampil di halaman kelas.`}
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
        label="Tampilkan nama saya di halaman kelas"
        hint="Bila tidak dicentang, testimoni tampil sebagai “Peserta kelas”."
      />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="secondary" loading={busy}>
          {initial ? "Simpan perubahan" : "Kirim testimoni"}
        </Button>
        {onCancel && (
          <Button type="button" variant="text" onClick={onCancel} disabled={busy}>
            Batal
          </Button>
        )}
      </div>
    </form>
  );
}
