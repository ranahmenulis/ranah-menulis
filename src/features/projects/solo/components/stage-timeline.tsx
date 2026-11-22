import { useLocale, useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/cn";
import { formatProjectDate } from "../../project-model";
import type { TimeZoneName } from "../../types";
import type { StageRow } from "../stage-model";

/**
 * The stages of this book, in order (SOL-02, AC-29): where it stands now and when each stage that
 * began did so. The state is written out, not carried by color alone (DESIGN.md 7.4).
 */
export function StageTimeline({ rows, zone }: { rows: StageRow[]; zone: TimeZoneName }) {
  const c = useT().projectsSolo.stage;
  const locale = useLocale();
  return (
    <section aria-labelledby="solo-tahap" className="grid gap-3">
      <h2 id="solo-tahap" className="heading-sm">
        {c.title}
      </h2>
      <ol className="grid">
        {rows.map((row) => (
          <li
            key={row.stage}
            aria-current={row.state === "berjalan" ? "step" : undefined}
            className="grid grid-cols-[1.25rem_1fr] gap-x-3 border-b border-line py-3"
          >
            <span
              aria-hidden
              className={cn(
                // The dot fills as the team moves the book on; the running stage pops in once.
                "mt-1 size-3 rounded-full border border-ink transition-[background-color,box-shadow] duration-300 ease-(--ease-out)",
                row.state === "selesai" && "bg-ink",
                row.state === "berjalan" &&
                  "rm-pop bg-canvas ring-2 ring-ink ring-offset-2 ring-offset-canvas",
                row.state === "menunggu" && "border-ink-muted",
              )}
            />
            <div className="grid min-w-0 gap-0.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <p
                  className={cn(
                    "text-base wrap-anywhere",
                    row.state === "menunggu" ? "text-ink-muted" : "font-medium text-ink",
                  )}
                >
                  {c.label[row.stage]}
                </p>
                <p className="text-xs text-ink-muted">
                  {c.state[row.state]}
                  {row.at !== null && ` · ${formatProjectDate(row.at, zone, locale)}`}
                </p>
              </div>
              {row.state === "berjalan" && (
                <p className="text-sm text-ink-muted">{c.hint[row.stage]}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
