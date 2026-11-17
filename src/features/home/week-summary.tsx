import type { StreakData } from "@/features/studio/hooks/use-streak-data";
import { weekComparison, wordTotals } from "@/features/studio/word-totals";
import { Row } from "./today-row";

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

/**
 * "Ringkasan" row of Beranda (client decision 17 November 2026): a sentence and three word
 * counts (this week, this month, this year). Calendar totals match Statistik; the sentence uses
 * rolling 7-day windows. Not drawn while loading, on error, or when there is no writing yet.
 */
export function WeekSummary({ data }: { data: StreakData }) {
  if (data.status !== "ready" || data.today === "") return null;
  const { recent, before } = weekComparison(data.words, data.today);
  const sentence = weekSentence(recent, before);
  if (sentence === null) return null;
  const totals = wordTotals(data.words, data.today);
  const items = [
    ["Minggu ini", totals.week],
    ["Bulan ini", totals.month],
    ["Tahun ini", totals.year],
  ] as const;

  return (
    <Row label="Ringkasan">
      <div className="col-span-full min-w-0 md:col-span-2">
        <p className="text-sm">{sentence}</p>
        <dl className="mt-3 grid grid-cols-3 gap-x-4">
          {items.map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="text-sm text-ink-muted">{label}</dt>
              <dd className="font-serif text-lg leading-6 font-semibold tabular-nums md:text-xl md:leading-7">
                {number.format(value)}
                <span className="ml-1 font-sans text-xs font-normal text-ink-muted">kata</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Row>
  );
}
