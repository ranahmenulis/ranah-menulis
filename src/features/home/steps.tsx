import { Check } from "@phosphor-icons/react/dist/ssr";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type Step = { label: string; done: boolean; action?: { label: string; href: string } };

/**
 * Three first steps for someone with no data yet (PRD 13.1): profile, daily target, first
 * document. Disappears once all are done. No percentages, badges or points.
 */
export function FirstSteps({
  hasTarget,
  hasDocument,
}: {
  hasTarget: boolean;
  hasDocument: boolean;
}) {
  const steps: Step[] = [
    // [konfirmasi] Profile setup belongs to the account screens (step 6); shown done for now.
    { label: "Lengkapi profil: negara dan zona waktu", done: true },
    {
      label: "Tetapkan target kata per hari",
      done: hasTarget,
      action: { label: "Tetapkan", href: "/studio/streak" },
    },
    {
      label: "Tulis dokumen pertamamu di Studio",
      done: hasDocument,
      action: { label: "Buka Studio", href: "/studio/baru" },
    },
  ];
  if (steps.every((s) => s.done)) return null;

  return (
    <ol aria-label="Tiga langkah awal" className="mb-6 border-t border-line">
      {steps.map((step) => (
        <li
          key={step.label}
          className="flex items-center gap-3 border-b border-line py-3.5 text-sm"
        >
          <span
            aria-hidden
            className={cn(
              "grid size-5 shrink-0 place-items-center rounded-full border-[1.5px] border-ink",
              step.done && "bg-ink text-on-ink",
            )}
          >
            {step.done && <Check size={12} weight="bold" />}
          </span>
          <span className={cn("min-w-0 flex-1", step.done && "text-ink-muted")}>{step.label}</span>
          {step.done ? (
            <span className="text-xs text-ink-muted">Selesai</span>
          ) : (
            step.action && (
              <ButtonLink href={step.action.href} variant="text" size="sm" className="text-ink">
                {step.action.label}
              </ButtonLink>
            )
          )}
        </li>
      ))}
    </ol>
  );
}
