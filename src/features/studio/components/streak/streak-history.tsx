"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatRun } from "../../streak-copy";
import { parseDay, type PastStreak } from "../../streak";

const INITIAL_ROWS = 10;
const shortDay = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" });

/**
 * Previous streaks (STK-09, N22): ended runs of 2+ days, newest first. Private to the writer
 * (BR-STK-09). [usulan] the 2-day floor and the 10-row start.
 */
export function StreakHistory({ items }: { items: PastStreak[] }) {
  const [all, setAll] = useState(false);
  const shown = all ? items : items.slice(0, INITIAL_ROWS);
  return (
    <section aria-labelledby="sh-heading" className="grid content-start gap-2">
      <h2 id="sh-heading" className="heading-md">
        Streak sebelumnya
      </h2>
      {items.length === 0 ? (
        <p className="border-t border-line pt-4 text-sm text-ink-muted">
          Belum ada streak yang berakhir. Streak yang putus setelah berlangsung 2 hari atau lebih
          akan muncul di sini.
        </p>
      ) : (
        <>
          <ul className="grid grid-cols-[minmax(0,1fr)] border-t border-line">
            {shown.map((run) => (
              <li key={run.start} className="border-b border-line py-3">
                <p className="text-base font-medium">
                  {run.length} hari
                  {run.longest && (
                    <span className="ml-2 rounded-full border border-line px-2 py-0.5 text-xs font-normal">
                      Terpanjang
                    </span>
                  )}
                </p>
                <p className="text-sm text-ink-muted">
                  {formatRun(run)} · putus pada {shortDay.format(parseDay(run.brokeOn))}
                </p>
              </li>
            ))}
          </ul>
          {!all && items.length > INITIAL_ROWS && (
            <Button
              variant="text"
              className="-ml-1 justify-self-start text-ink"
              onClick={() => setAll(true)}
            >
              Tampilkan semua ({items.length})
            </Button>
          )}
        </>
      )}
    </section>
  );
}
