"use client";

import { ChartLineUp } from "@phosphor-icons/react/dist/ssr";
import { Section } from "@/components/ui/section-card";
import { useToday } from "@/features/studio/hooks/use-today";
import { format, useT } from "@/lib/i18n/provider";
import { useFormat } from "@/lib/i18n/use-format";
import { challengeState, circleTotal, daysLeft, kindOf, periodOf } from "../board-model";
import type { GroupResult } from "../group-actions";
import { memberOf, type WritingGroup } from "../group-model";
import { useCircleSync } from "../use-circle-sync";
import { BoardToggle } from "./board-toggle";

const asDate = (day: string) => {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d);
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2.5 text-sm">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="font-medium">{children}</dd>
    </div>
  );
}

/**
 * What a member sees at the top of a circle: its type, the period that is counted, how long a
 * challenge still runs, and the words written by members who joined the leaderboard. It is only
 * drawn for members: the totals are not public, even for a public circle.
 */
export function CircleStats({
  group,
  reader,
  onResult,
}: {
  group: WritingGroup;
  reader: string;
  onResult: (result: GroupResult) => void;
}) {
  const dict = useT().groups;
  const t = dict.stats;
  const { number, date } = useFormat();
  const today = useToday();
  const me = memberOf(group, reader);
  useCircleSync(group.id, me?.board === true, me?.boardSince);
  // The day is the visitor's, so it is only known after the page has loaded.
  if (!today) return null;

  const kind = kindOf(group);
  const state = challengeState(group, today);
  const period = periodOf(group, today);
  const left = daysLeft(group, today);
  const day = (value: string) =>
    date(asDate(value), { day: "numeric", month: "long", year: "numeric" });

  return (
    <Section id="circle-stats" title={t.title} icon={ChartLineUp} className="gap-1">
      <dl className="divide-y divide-line">
        <Row label={t.kind}>{dict.hero.kinds[kind]}</Row>
        <Row label={t.period}>
          {kind === "challenge"
            ? format(t.periodRange, { from: day(period.from), to: day(period.to) })
            : format(t.periodMonth, {
                month: date(asDate(period.from), { month: "long", year: "numeric" }),
              })}
        </Row>
        {state && <Row label={t.state}>{t.states[state]}</Row>}
        {state === "running" && (
          <Row label={t.daysLeft}>{format(t.daysLeftValue, { count: number(left) })}</Row>
        )}
        <Row label={t.total}>
          <span className="tabular-nums">{number(circleTotal(group, today))}</span>
        </Row>
      </dl>
      <p className="text-xs text-ink-muted">{t.totalHint}</p>
      <BoardToggle group={group} reader={reader} today={today} onResult={onResult} />
    </Section>
  );
}
