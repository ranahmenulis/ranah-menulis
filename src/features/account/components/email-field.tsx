"use client";

import type { ReactNode } from "react";
import { describedBy, Field, Input } from "@/components/ui/field";
import { useT } from "@/lib/i18n/provider";

type Props = {
  value: string;
  onChange: (value: string) => void;
  error?: ReactNode;
  id?: string;
};

export function EmailField({ value, onChange, error, id = "email" }: Props) {
  const { fields } = useT().account;
  return (
    <Field id={id} label={fields.email} error={error}>
      <Input
        id={id}
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, { error })}
      />
    </Field>
  );
}

/** Moves focus to the first of these inputs that exists, after a submit that found mistakes. */
export function focusFirst(ids: string[]) {
  for (const id of ids) {
    const element = document.getElementById(id);
    if (element) return element.focus();
  }
}
