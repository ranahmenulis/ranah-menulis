import type { ReactNode } from "react";
import { CheckChoice } from "@/components/ui/choice";
import { Field, Input, Select, Textarea, describedBy } from "@/components/ui/field";
import type { InputErrors, ProjectInput } from "../project-input";

export type FormApi = {
  input: ProjectInput;
  errors: InputErrors;
  set: <K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) => void;
};

type TextProps = {
  api: FormApi;
  name: Exclude<keyof ProjectInput, "anonymous" | "category" | "zone">;
  label: string;
  hint?: ReactNode;
  rows?: number;
  disabled?: boolean;
  optional?: boolean;
  type?: "text" | "date";
};

/** One text field wired to the form: label, hint and the error that names its rule. */
export function TextField({ api, name, label, hint, rows, disabled, optional, type }: TextProps) {
  const id = `proyek-${name}`;
  const error = api.errors[name];
  const common = {
    id,
    value: api.input[name],
    disabled,
    "aria-invalid": error ? (true as const) : undefined,
    "aria-describedby": describedBy(id, { hint, error }),
    onChange: (e: { target: { value: string } }) => api.set(name, e.target.value),
  };
  return (
    <Field id={id} label={label} hint={hint} error={error} optional={optional}>
      {rows ? <Textarea rows={rows} {...common} /> : <Input type={type ?? "text"} {...common} />}
    </Field>
  );
}

/** The part of the form that differs per category (PRD 10.6: SOL-01, KLS-01, LMB-01). */
export function CategoryFields({ api }: { api: FormApi }) {
  const { input, errors } = api;
  const blockError = errors.block;
  return (
    <fieldset className="grid gap-4 border-t border-line pt-5">
      <legend className="pr-2 heading-sm">
        {
          { antologi: "Antologi", solo: "Paket Solo", kelas: "Kelas", lomba: "Lomba" }[
            input.category
          ]
        }
      </legend>
      {blockError && (
        <p role="alert" className="text-sm text-danger">
          {blockError}
        </p>
      )}
      {input.category === "antologi" && (
        <>
          <TextField api={api} name="theme" label="Tema" />
          <TextField
            api={api}
            name="stages"
            label="Tahap"
            rows={4}
            hint="Satu tahap per baris, dari pendaftaran sampai produksi."
          />
        </>
      )}
      {input.category === "solo" && (
        <TextField
          api={api}
          name="packages"
          label="Paket"
          rows={4}
          hint="Satu paket per baris: nama | harga rupiah | butir; butir. Harga ringgit menyusul."
        />
      )}
      {input.category === "kelas" && (
        <>
          <TextField api={api} name="teacherName" label="Nama pengajar" />
          <TextField api={api} name="teacherBio" label="Profil pengajar" rows={3} />
          <TextField
            api={api}
            name="modules"
            label="Modul"
            rows={4}
            hint="Satu modul per baris: judul | jumlah pertemuan. Materi dan sesi diisi di langkah lain."
          />
        </>
      )}
      {input.category === "lomba" && (
        <>
          <TextField
            api={api}
            name="criteria"
            label="Kriteria penilaian"
            rows={4}
            hint="Satu kriteria per baris: nama | bobot. Bobot berjumlah 100."
          />
          <TextField
            api={api}
            name="prizes"
            label="Hadiah"
            rows={3}
            hint="Satu hadiah per baris."
          />
          <CheckChoice
            label="Lomba anonim"
            hint="Juri tidak melihat nama peserta selama penilaian (BR-PRJ-08)."
            checked={input.anonymous}
            onChange={(e) => api.set("anonymous", e.target.checked)}
          />
        </>
      )}
    </fieldset>
  );
}

export function ZoneSelect({ api, disabled }: { api: FormApi; disabled?: boolean }) {
  return (
    <Field
      id="proyek-zone"
      label="Zona waktu"
      hint="Tenggat jatuh di akhir harinya menurut zona ini."
    >
      <Select
        id="proyek-zone"
        value={api.input.zone}
        disabled={disabled}
        onChange={(e) => api.set("zone", e.target.value as ProjectInput["zone"])}
      >
        <option value="WIB">WIB (Indonesia)</option>
        <option value="MYT">MYT (Malaysia)</option>
      </Select>
    </Field>
  );
}
