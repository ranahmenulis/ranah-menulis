"use client";

import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
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
      <div className="relative">
        <EnvelopeSimple
          size={20}
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-muted"
        />
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
          className="pl-10"
        />
      </div>
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
