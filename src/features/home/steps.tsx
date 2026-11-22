import { Check } from "@phosphor-icons/react/dist/ssr";
import { Button, ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/provider";
import { dismissFirstSteps, useFirstStepsDismissed } from "./first-steps-store";

type Step = { label: string; done: boolean; action?: { label: string; href: string } };

/**
 * Three first steps for someone with no data yet (PRD 13.1): profile, daily target, first
 * document. Disappears once all are done, or when the writer closes it for good ("Tutup panduan",
 * client decision 17 November 2026). No percentages, badges or points.
 */
export function FirstSteps({
  hasTarget,
  hasDocument,
}: {
  hasTarget: boolean;
  hasDocument: boolean;
}) {
  const t = useT().home;
  const s = t.steps;
  const steps: Step[] = [
    // [konfirmasi] Profile setup belongs to the account screens (step 6); shown done for now.
    { label: s.profile, done: true },
    {
      label: s.target,
      done: hasTarget,
      action: { label: s.setTarget, href: "/studio/streak" },
    },
    {
      label: s.firstDocument,
      done: hasDocument,
      action: { label: s.openStudio, href: "/studio/baru" },
    },
  ];
  const dismissed = useFirstStepsDismissed();
  if (dismissed || steps.every((s) => s.done)) return null;

  return (
    <div className="mt-2">
      <ol aria-label={t.today.stepsTitle}>
        {steps.map((step) => (
          <li
            key={step.label}
            className="flex items-center gap-3 border-t border-line py-3 text-sm first:border-t-0"
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
            <span className={cn("min-w-0 flex-1", step.done && "text-ink-muted")}>
              {step.label}
            </span>
            {step.done ? (
              <span className="text-xs text-ink-muted">{s.done}</span>
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
      <div className="flex justify-end border-t border-line pt-2">
        <Button
          variant="text"
          size="sm"
          onClick={() => {
            dismissFirstSteps();
            // The button is about to disappear; keep keyboard focus on the page title.
            document.getElementById("beranda-title")?.focus();
          }}
        >
          {s.close}
        </Button>
      </div>
    </div>
  );
}
