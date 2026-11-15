"use client";

import { useState } from "react";
import { Popover } from "@/components/ui/popover";
import { cn } from "@/lib/cn";
import { DAILY_TARGET, topDocuments, totalWords, type DailyLog } from "../daily-progress";

type TargetIndicatorProps = {
  progress: DailyLog;
  /** Offline: the count keeps moving from local data and is marked as recorded later. */
  pending: boolean;
  className?: string;
};

const number = new Intl.NumberFormat("id-ID");

/**
 * Words written today across all documents, as "468 / 500 hari ini" (DESIGN.md 5.4). It changes
 * after a save completes, not on every keystroke, and looks different from the document word
 * count on purpose. Reaching the target fills the ring once; nothing interrupts writing.
 * [usulan] The Streak sentence and "Buka Streak" link arrive with the Streak tab (step 4).
 */
export function TargetIndicator({ progress, pending, className }: TargetIndicatorProps) {
  const total = totalWords(progress);
  const reached = total >= DAILY_TARGET;
  const [open, setOpen] = useState(false);

  // Fill the ring only when this session crosses the target, not when a finished day is reopened.
  const [wasReached, setWasReached] = useState(reached);
  const [justReached, setJustReached] = useState(false);
  if (reached !== wasReached) {
    setWasReached(reached);
    if (reached) setJustReached(true);
  }

  const docs = topDocuments(progress);
  const remaining = DAILY_TARGET - total;
  const note = pending
    ? "Tercatat saat tersambung. Kata dari perangkat ini dikirim nanti, dihitung ke hari kamu menulisnya, dan tidak dihitung dua kali."
    : reached
      ? "Target hari ini sudah tercapai. Angka tetap bertambah selama kamu menulis."
      : `${number.format(remaining)} kata lagi untuk target hari ini.`;

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      label="Kata hari ini"
      className={cn("max-md:static", className)}
      panelClassName="w-80 p-4 text-sm max-md:inset-x-4 max-md:w-auto"
      renderTrigger={(props) => (
        <button
          {...props}
          type="button"
          title="Kata hari ini dari semua dokumen"
          aria-label={`Kata hari ini dari semua dokumen: ${total} dari target ${DAILY_TARGET}${pending ? ", sebagian tercatat saat tersambung" : ""}. Buka rincian`}
          className="group inline-flex min-h-8 cursor-pointer flex-wrap items-center justify-end gap-x-1.5 text-xs text-ink-muted tabular-nums"
        >
          <Dot reached={reached} fresh={justReached} />
          <b className="font-medium whitespace-nowrap text-ink group-hover:underline group-hover:underline-offset-3 group-aria-expanded:underline">
            {number.format(total)} / {number.format(DAILY_TARGET)}
          </b>
          <span className="whitespace-nowrap">hari ini</span>
          {pending && (
            <span className="max-md:basis-full max-md:text-right">· tercatat saat tersambung</span>
          )}
        </button>
      )}
    >
      <div className="grid grid-cols-[minmax(0,1fr)] gap-3">
        <p className="font-medium text-pretty">
          {justReached ? "Target hari ini tercapai." : "Kata hari ini dari semua dokumen"}
        </p>
        <p className="text-xs leading-[18px] text-pretty text-ink-muted">{note}</p>
        {docs.length > 0 && (
          <ul className="grid grid-cols-[minmax(0,1fr)] border-t border-line">
            {docs.map((d) => (
              <li key={d.id} className="flex items-baseline gap-3 border-b border-line py-2">
                <span className="min-w-0 flex-1 truncate">{d.title || "Tanpa judul"}</span>
                <span className="text-ink-muted tabular-nums">{number.format(d.words)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Popover>
  );
}

function Dot({ reached, fresh }: { reached: boolean; fresh: boolean }) {
  if (!reached) {
    return (
      <i
        aria-hidden
        className="size-2.5 shrink-0 rounded-full shadow-[inset_0_0_0_1.5px_var(--ink)]"
      />
    );
  }
  if (!fresh) return <i aria-hidden className="size-2.5 shrink-0 rounded-full bg-ink" />;
  return (
    <i
      aria-hidden
      className={cn(
        "relative size-2.5 shrink-0 rounded-full shadow-[inset_0_0_0_1.5px_var(--ink)]",
        "after:absolute after:inset-0 after:scale-0 after:rounded-full after:bg-ink after:content-['']",
        "motion-safe:after:animate-[rm-fill_300ms_cubic-bezier(0.2,0,0,1)_forwards]",
        "motion-reduce:after:scale-100",
      )}
    />
  );
}
