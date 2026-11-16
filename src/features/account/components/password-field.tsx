"use client";

import { Eye, EyeSlash } from "@phosphor-icons/react/dist/ssr";
import { useState, type ReactNode } from "react";
import { describedBy, Field, Input } from "@/components/ui/field";
import { IconButton } from "@/components/ui/icon-button";
import { useT } from "@/lib/i18n/provider";

type Props = {
  id: string;
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  hint?: ReactNode;
  error?: ReactNode;
  autoComplete: "current-password" | "new-password";
};

/** Password input with a show/hide switch. The label, hint, and error are the shared Field's. */
export function PasswordField({ id, label, value, onChange, hint, error, autoComplete }: Props) {
  const { fields } = useT().account;
  const [shown, setShown] = useState(false);
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <div className="relative">
        <Input
          id={id}
          name={id}
          type={shown ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          autoCapitalize="none"
          spellCheck={false}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, { hint, error })}
          className="pr-12"
        />
        <IconButton
          label={shown ? fields.hidePassword : fields.showPassword}
          aria-pressed={shown}
          onClick={() => setShown((v) => !v)}
          className="absolute top-0.5 right-0.5 size-10"
        >
          {shown ? <EyeSlash size={20} aria-hidden /> : <Eye size={20} aria-hidden />}
        </IconButton>
      </div>
    </Field>
  );
}
