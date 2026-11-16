import { describedBy, Field, Input, Select, Textarea } from "@/components/ui/field";
import { formatNumber } from "../project-model";
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

const counter = (text: string, limit: number) =>
  `${formatNumber(text.trim().length)} dari ${formatNumber(limit)} karakter`;

/** Title, genre (the kind of book for Solo), synopsis (Solo), and the optional note for the editor. */
export function SubmitInfoFields({ project, form, errorOf, onChange }: Props) {
  const solo = project.block.kind === "solo";

  // Each control points at its own error or hint, and is marked invalid while it has an error.
  const aria = (id: string, field: ProblemField, hint = false) => ({
    "aria-invalid": errorOf(field) ? (true as const) : undefined,
    "aria-describedby": describedBy(id, { hint, error: errorOf(field) }),
  });

  return (
    <Section title="Informasi karya">
      <Field id="kirim-title" label="Judul karya" error={errorOf("title")}>
        <Input
          id="kirim-title"
          value={form.title}
          maxLength={TITLE_LIMIT + 20}
          {...aria("kirim-title", "title")}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </Field>
      <Field id="kirim-genre" label={solo ? "Jenis buku" : "Genre"} error={errorOf("genre")}>
        <Select
          id="kirim-genre"
          value={form.genre}
          {...aria("kirim-genre", "genre")}
          onChange={(e) => onChange({ genre: e.target.value })}
        >
          <option value="">{solo ? "Pilih jenis buku" : "Pilih genre"}</option>
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
          label="Sinopsis"
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
        label="Catatan untuk editor"
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
