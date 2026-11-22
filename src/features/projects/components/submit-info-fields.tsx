import { formatNumber } from "@/lib/i18n/format";
import { fill } from "@/features/studio/copy/fill";
import { useLocale, useT } from "@/lib/i18n/provider";
import { describedBy, Field, Input, Select, Textarea } from "@/components/ui/field";
import { genreOptions, type ProblemField, type SubmitForm } from "../submission-model";
import { NOTE_LIMIT, SYNOPSIS_LIMIT, TITLE_LIMIT } from "../submission-types";
import type { Project } from "../types";
import { Section } from "./category-blocks";

type Props = {
  project: Project;
  form: SubmitForm;
  errorOf: (field: ProblemField) => string | undefined;
  onChange: (patch: Partial<SubmitForm>) => void;
};

/** Title, genre (the kind of book for Solo), synopsis (Solo), and the optional note for the editor. */
export function SubmitInfoFields({ project, form, errorOf, onChange }: Props) {
  const t = useT().projectsFlow.submit.info;
  const locale = useLocale();
  const solo = project.block.kind === "solo";
  const counter = (text: string, limit: number) =>
    fill(t.counter, {
      n: formatNumber(text.trim().length, locale),
      limit: formatNumber(limit, locale),
    });

  // Each control points at its own error or hint, and is marked invalid while it has an error.
  const aria = (id: string, field: ProblemField, hint = false) => ({
    "aria-invalid": errorOf(field) ? (true as const) : undefined,
    "aria-describedby": describedBy(id, { hint, error: errorOf(field) }),
  });

  return (
    <Section title={t.section}>
      <Field id="kirim-title" label={t.title} error={errorOf("title")}>
        <Input
          id="kirim-title"
          value={form.title}
          maxLength={TITLE_LIMIT + 20}
          {...aria("kirim-title", "title")}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </Field>
      <Field id="kirim-genre" label={solo ? t.bookType : t.genre} error={errorOf("genre")}>
        <Select
          id="kirim-genre"
          value={form.genre}
          {...aria("kirim-genre", "genre")}
          onChange={(e) => onChange({ genre: e.target.value })}
        >
          <option value="">{solo ? t.chooseBookType : t.chooseGenre}</option>
          {genreOptions(project).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </Field>
      {solo && (
        <Field
          id="kirim-synopsis"
          label={t.synopsis}
          hint={counter(form.synopsis, SYNOPSIS_LIMIT)}
          error={errorOf("synopsis")}
        >
          <Textarea
            id="kirim-synopsis"
            value={form.synopsis}
            {...aria("kirim-synopsis", "synopsis", true)}
            onChange={(e) => onChange({ synopsis: e.target.value })}
          />
        </Field>
      )}
      <Field
        id="kirim-note"
        label={t.note}
        optional
        hint={counter(form.note, NOTE_LIMIT)}
        error={errorOf("note")}
      >
        <Textarea
          id="kirim-note"
          value={form.note}
          {...aria("kirim-note", "note", true)}
          onChange={(e) => onChange({ note: e.target.value })}
        />
      </Field>
    </Section>
  );
}
