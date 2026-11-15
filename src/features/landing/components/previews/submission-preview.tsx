"use client";

import { Check } from "@phosphor-icons/react/dist/ssr";
import { BookCover } from "@/components/ui/book-cover";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/provider";
import { reached, useLoopTime } from "../../motion/use-loop";

// One subject per cycle: the submission turns from sent to accepted, then the note that the sent
// version stays fixed while the draft keeps changing.
const RESET_MS = 150;
const ACCEPTED_AT = 900;
const NOTE_AT = 1600;

const badge =
  "inline-flex h-6 items-center gap-1.5 justify-self-start rounded-full border px-2.5 text-xs font-medium";

export function SubmissionPreview() {
  const { previews } = useT().landing;
  const time = useLoopTime();
  const instant = time !== null && time < RESET_MS;
  const accepted = reached(time, ACCEPTED_AT);
  const note = reached(time, NOTE_AT);

  return (
    <>
      <div className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-4 p-4 md:grid-cols-[64px_minmax(0,1fr)_auto] md:px-6 md:py-5">
        <BookCover title="Surat yang Tidak Pernah Terkirim" width={64} />
        <div className="min-w-0">
          <h4 className="text-base leading-6 font-semibold">
            Antologi: Surat yang Tidak Pernah Terkirim
          </h4>
          <span className="text-xs text-ink-muted">{previews.submissionMeta}</span>
        </div>
        <span
          // A new key on the change replays the short pop; the label never shows two words at once.
          key={accepted ? "accepted" : "sent"}
          className={cn(
            badge,
            "col-start-2 md:col-start-auto",
            accepted ? "border-line-strong" : "border-line text-ink-muted",
            time !== null && !instant && "animate-[lp-pop_200ms_var(--ease-out)]",
          )}
        >
          {accepted && <Check size={14} aria-hidden />}
          {accepted ? previews.accepted : previews.sent}
        </span>
      </div>
      <div className="grid grid-cols-[64px_minmax(0,1fr)] gap-4 border-t border-line p-4 md:px-6 md:py-5">
        <span />
        <span
          className={cn(
            "text-xs text-ink-muted",
            !instant && "transition-[opacity,transform] duration-300 ease-out",
            note ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
          )}
        >
          {previews.submissionNote}
        </span>
      </div>
    </>
  );
}
