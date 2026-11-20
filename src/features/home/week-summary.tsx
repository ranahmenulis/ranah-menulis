import type { StreakData } from "@/features/studio/hooks/use-streak-data";
import { weekComparison, wordTotals } from "@/features/studio/word-totals";

const number = new Intl.NumberFormat("id-ID");

/**
 * One warm sentence about the last 7 days against the 7 before. No percentages and no praise
 * scale (DESIGN.md): a quiet week is met with an invitation, not a penalty. Null when there is
 * nothing to say.
 */
export function weekSentence(recent: number, before: number): string | null {
  if (recent === 0 && before === 0) return null;
  const words = (n: number) => `${number.format(n)} kata`;
  if (before === 0) return `7 hari terakhir kamu menulis ${words(recent)}. Awal yang baik.`;
  if (recent === 0) {
    return `7 hari terakhir belum ada tulisan, setelah ${words(before)} di 7 hari sebelumnya. Mulai lagi hari ini saja.`;
  }
  if (recent === before) {
    return `7 hari terakhir kamu menulis ${words(recent)}, sama dengan 7 hari sebelumnya.`;
  }
  const gap = Math.abs(recent - before);
  return recent > before
    ? `7 hari terakhir kamu menulis ${words(recent)}, ${words(gap)} lebih banyak dari 7 hari sebelumnya.`
    : `7 hari terakhir kamu menulis ${words(recent)}, ${words(gap)} lebih sedikit dari 7 hari sebelumnya. Mulai lagi hari ini saja.`;
}

/** The sentence for the Beranda greeting, or null while loading, on error, or with no writing. */
export function greetingSentence(data: StreakData): string | null {
  if (data.status !== "ready" || data.today === "") return null;
  const { recent, before } = weekComparison(data.words, data.today);
  return weekSentence(recent, before);
}

/**
 * Three word counts (this week, this month, this year; client decision 17 November 2026) for the
 * progress section of the side column. Calendar totals match Statistik. Not drawn while there is
 * nothing to count.
 */
export function WordTotals({ data }: { data: StreakData }) {
  if (greetingSentence(data) === null) return null;
  const totals = wordTotals(data.words, data.today);
  const items = [
    ["Minggu ini", totals.week],
    ["Bulan ini", totals.month],
    ["Tahun ini", totals.year],
  ] as const;

  return (
    <dl className="grid grid-cols-3 gap-x-4 border-t border-line pt-3">
      {items.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <dt className="text-xs text-ink-muted">{label}</dt>
          <dd className="font-serif text-lg leading-6 font-semibold tabular-nums">
            {number.format(value)}
            <span className="ml-1 font-sans text-xs font-normal text-ink-muted">kata</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
