import type { ReactNode } from "react";
import { CheckChoice } from "@/components/ui/choice";
import { Field, Input, Select, Textarea, describedBy } from "@/components/ui/field";
import { useT } from "@/lib/i18n/provider";
import type { InputErrors, ProjectInput } from "../project-input";
import { Stack } from "@phosphor-icons/react/dist/ssr";
import { FieldGroup } from "../../components/field-group";

export type FormApi = {
  input: ProjectInput;
  errors: InputErrors;
  set: <K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) => void;
};

type TextProps = {
  api: FormApi;
  name: Exclude<keyof ProjectInput, "anonymous" | "category" | "zone" | "posterId">;
  /** The label; defaults to the dictionary entry for the field. */
  label?: string;
  hint?: ReactNode;
  rows?: number;
  disabled?: boolean;
  optional?: boolean;
  type?: "text" | "date";
};

/** One text field wired to the form: label, hint and the error that names its rule. */
export function TextField({ api, name, label, hint, rows, disabled, optional, type }: TextProps) {
  const fields = useT().kelolaOrganizer.form.fields;
  const copy = (fields as Record<string, { label: string; hint?: string }>)[name];
  const shownHint = hint ?? copy?.hint;
  const id = `proyek-${name}`;
  const error = api.errors[name];
  const common = {
    id,
    value: api.input[name],
    disabled,
    "aria-invalid": error ? (true as const) : undefined,
    "aria-describedby": describedBy(id, { hint: shownHint, error }),
    onChange: (e: { target: { value: string } }) => api.set(name, e.target.value),
  };
  return (
    <Field
      id={id}
      label={label ?? copy?.label ?? name}
      hint={shownHint}
      error={error}
      optional={optional}
    >
      {rows ? <Textarea rows={rows} {...common} /> : <Input type={type ?? "text"} {...common} />}
    </Field>
  );
}

/** The part of the form that differs per category (PRD 10.6: SOL-01, KLS-01, LMB-01). */
export function CategoryFields({ api }: { api: FormApi }) {
  const { input, errors } = api;
  const t = useT().kelolaOrganizer.form;
  const blockError = errors.block;
  return (
    <FieldGroup title={t.legend[input.category]} icon={Stack}>
      {blockError && (
        <p role="alert" className="text-sm text-danger">
          {blockError}
        </p>
      )}
      {input.category === "antologi" && (
        <>
          <TextField api={api} name="theme" />
          <TextField api={api} name="stages" rows={4} />
        </>
      )}
      {input.category === "solo" && <TextField api={api} name="packages" rows={4} />}
      {input.category === "kelas" && (
        <>
          <TextField api={api} name="teacherName" />
          <TextField api={api} name="teacherBio" rows={3} />
          <TextField api={api} name="modules" rows={4} />
        </>
      )}
      {input.category === "lomba" && (
        <>
          <TextField api={api} name="criteria" rows={4} />
          <TextField api={api} name="prizes" rows={3} />
          <CheckChoice
            label={t.anonymous.label}
            hint={t.anonymous.hint}
            checked={input.anonymous}
            onChange={(e) => api.set("anonymous", e.target.checked)}
          />
        </>
      )}
    </FieldGroup>
  );
}

export function ZoneSelect({ api, disabled }: { api: FormApi; disabled?: boolean }) {
  const t = useT().kelolaOrganizer.form.zone;
  return (
    <Field id="proyek-zone" label={t.label} hint={t.hint}>
      <Select
        id="proyek-zone"
        value={api.input.zone}
        disabled={disabled}
        onChange={(e) => api.set("zone", e.target.value as ProjectInput["zone"])}
      >
        <option value="WIB">{t.WIB}</option>
        <option value="MYT">{t.MYT}</option>
      </Select>
    </Field>
  );
}
