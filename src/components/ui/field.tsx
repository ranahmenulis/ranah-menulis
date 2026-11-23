import type { ComponentProps, ReactNode } from "react";
import { CaretDown, CheckCircle, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";
import { CommonText } from "./common-text";

type FieldProps = {
  id: string;
  label: ReactNode;
  optional?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  /** Kabar baik yang perlu dibaca (misalnya email belum terdaftar). Monokrom, bukan hijau. */
  success?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Label selalu terlihat di atas field. Konsumen memberi id yang sama ke kontrolnya. */
export function Field({
  id,
  label,
  optional,
  hint,
  error,
  success,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn("grid min-w-0 gap-2", className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {optional && (
          <span className="font-normal text-ink-muted">
            {" ("}
            <CommonText name="optional" />
            {")"}
          </span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="flex items-start gap-1.5 text-sm text-danger">
          <WarningCircle size={20} className="shrink-0" aria-hidden />
          <span>{error}</span>
        </p>
      )}
      {success && !error && (
        <p className="flex items-start gap-1.5 text-sm font-medium text-ink">
          <CheckCircle size={20} className="shrink-0" aria-hidden />
          <span>{success}</span>
        </p>
      )}
    </div>
  );
}

/** Id elemen yang menjelaskan field, untuk aria-describedby. */
export function describedBy(id: string, { hint, error }: { hint?: unknown; error?: unknown }) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

const control =
  "w-full border border-line bg-surface px-3 text-base text-ink rounded-lg appearance-none " +
  "focus:border-accent-ink aria-invalid:border-danger disabled:opacity-(--opacity-disabled)";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(control, "h-11", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-28 py-3", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select className={cn(control, "rm-select h-11 pr-10", className)} {...props}>
        {children}
      </select>
      <CaretDown
        size={20}
        aria-hidden
        className="pointer-events-none absolute top-3 right-3 text-ink-muted"
      />
    </div>
  );
}
