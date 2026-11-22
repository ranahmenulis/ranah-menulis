"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, describedBy } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import { format, useT } from "@/lib/i18n/provider";
import { useFormat } from "@/lib/i18n/use-format";
import { parseTarget, TARGET_PRESETS } from "../../target-setting";

type TargetDialogProps = {
  open: boolean;
  /** The target in force today, or null when none is set. */
  current: number | null;
  onClose: () => void;
  onSave: (value: number) => void;
};

/**
 * Set the daily word target. A change applies from tomorrow (PRD STK-01), and the dialog says so
 * before saving. The very first target applies today.
 */
export function TargetDialog({ open, current, onClose, onSave }: TargetDialogProps) {
  const t = useT().studioStreak.dialog;
  const { number } = useFormat();
  const [text, setText] = useState(String(current ?? 500));
  const value = parseTarget(text);
  const invalid = text.trim() !== "" && value === null;
  const error = invalid ? t.error : undefined;
  const hint =
    value === null
      ? undefined
      : current === null
        ? t.hintFirst
        : value === current
          ? format(t.hintSame, { current: number(current) })
          : format(t.hintChange, { current: number(current), value: number(value) });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={current === null ? t.titleFirst : t.title}
      description={t.description}
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t.cancel}
          </Button>
          <Button
            disabled={value === null || value === current}
            onClick={() => value !== null && onSave(value)}
          >
            {t.save}
          </Button>
        </>
      }
    >
      <div className="flex flex-wrap gap-2" role="group" aria-label={t.presets}>
        {TARGET_PRESETS.map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={value === n}
            onClick={() => setText(String(n))}
            className={cn(
              "h-8 cursor-pointer rounded-full px-4 text-sm",
              value === n ? "bg-ink text-on-ink" : "bg-subtle text-ink",
            )}
          >
            {number(n)}
          </button>
        ))}
      </div>
      <Field id="target" label={t.field} hint={hint} error={error}>
        <Input
          id="target"
          inputMode="numeric"
          value={text}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy("target", { hint, error })}
          onChange={(e) => setText(e.target.value)}
        />
      </Field>
    </Dialog>
  );
}
