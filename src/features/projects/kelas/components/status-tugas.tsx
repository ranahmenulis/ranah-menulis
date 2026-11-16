import { Check } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";
import { stateLabel } from "../class-text";
import type { AssignmentState } from "../types";

const pill =
  "inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-xs whitespace-nowrap";

const tone: Record<Exclude<AssignmentState, "terkunci">, string> = {
  "belum-dikumpulkan": "border-dashed border-ink-faint text-ink-muted",
  terlambat: "border-line-strong text-ink font-medium",
  dikumpulkan: "border-line text-ink",
  // The one filled pill, like Perlu Revisi: the participant has something to do (DESIGN.md 7.4).
  "perlu-perbaikan": "border-ink bg-ink text-on-ink font-medium",
  selesai: "border-line-strong text-ink font-medium",
};

/**
 * Where an assignment stands, in the monochrome language of submission statuses (DESIGN.md 7.4):
 * the more there is for you to do, the heavier it looks. A text label is always there.
 */
export function StatusTugas({ state, className }: { state: AssignmentState; className?: string }) {
  if (state === "terkunci") {
    return <span className={cn("text-xs text-ink-muted", className)}>{stateLabel[state]}</span>;
  }
  return (
    <span className={cn(pill, tone[state], className)}>
      {state === "selesai" && <Check size={14} aria-hidden />}
      {stateLabel[state]}
    </span>
  );
}
