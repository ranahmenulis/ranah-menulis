"use client";

import { Check } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/provider";
import { PASSWORD_MIN, PASSWORD_PARTS } from "../validation";

/** Which of the sign-up password rules (`passwordIssue`) the typed value already meets. */
export function passwordRules(value: string) {
  return {
    length: value.length >= PASSWORD_MIN,
    lower: PASSWORD_PARTS.lower.test(value),
    upper: PASSWORD_PARTS.upper.test(value),
    number: PASSWORD_PARTS.number.test(value),
    symbol: PASSWORD_PARTS.symbol.test(value),
  };
}

/**
 * The password rules as a hint that ticks while typing. It sits inside the field's hint paragraph,
 * so it is spans only; the field's error still says what is wrong after submitting.
 */
export function PasswordRules({ value }: { value: string }) {
  const { passwordRules: copy } = useT().account.fields;
  const met = passwordRules(value);
  return (
    <span className="flex flex-wrap gap-x-4 gap-y-1">
      {(["length", "lower", "upper", "number", "symbol"] as const).map((rule) => (
        <span
          key={rule}
          data-met={met[rule] || undefined}
          className={cn(
            "inline-flex items-center gap-1.5 transition-colors duration-150",
            met[rule] ? "text-accent-ink" : "text-ink-muted",
          )}
        >
          <span
            className={cn(
              "grid size-4 place-items-center rounded-full border transition-colors duration-150",
              met[rule] ? "border-accent bg-accent text-on-accent" : "border-line",
            )}
          >
            {met[rule] && <Check size={10} weight="bold" aria-hidden />}
          </span>
          {copy[rule]}
        </span>
      ))}
    </span>
  );
}
