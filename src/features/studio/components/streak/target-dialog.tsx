"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, describedBy } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import { parseTarget, TARGET_PRESETS } from "../../target-setting";

const number = new Intl.NumberFormat("id-ID");

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
  const [text, setText] = useState(String(current ?? 500));
  const value = parseTarget(text);
  const invalid = text.trim() !== "" && value === null;
  const error = invalid ? "Isi angka bulat antara 1 dan 100.000." : undefined;
  const hint =
    value === null
      ? undefined
      : current === null
        ? "Target berlaku mulai hari ini. Tulisanmu hari ini ikut dihitung."
        : value === current
          ? `Target saat ini ${number.format(current)} kata per hari.`
          : `Hari ini tetap ${number.format(current)} kata. Target ${number.format(value)} kata berlaku mulai besok.`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={current === null ? "Tetapkan target harian" : "Atur target harian"}
      description="Berapa kata yang ingin kamu tulis setiap hari. Setiap hari yang tercapai menjadi satu titik di kalendermu."
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button
            disabled={value === null || value === current}
            onClick={() => value !== null && onSave(value)}
          >
            Simpan
          </Button>
        </>
      }
    >
      <div className="flex flex-wrap gap-2" role="group" aria-label="Pilihan cepat">
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
            {number.format(n)}
          </button>
        ))}
      </div>
      <Field id="target" label="Kata per hari" hint={hint} error={error}>
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
