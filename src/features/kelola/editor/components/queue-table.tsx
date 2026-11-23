"use client";

import Link from "next/link";
import { fill } from "@/features/studio/copy/fill";
import { useT } from "@/lib/i18n/provider";
import { useFormat } from "@/lib/i18n/use-format";
import { StatusSubmission } from "@/components/ui/status-submission";
import { MAX_REVISIONS } from "@/features/projects/submission-status";
import { sentAtText } from "@/features/projects/submission-text";
import { reviewHref } from "../area-hrefs";
import type { QueueRow } from "../queue-model";

const th = "h-11 px-3 text-left text-xs font-medium text-ink-muted first:pl-0";
const td = "px-3 py-2 align-middle first:pl-0 max-sm:block max-sm:px-0 max-sm:py-0.5";

/**
 * The queue as a dense table (DESIGN.md 6.7: 14px, 44px rows, sticky header, no zebra). Below sm it
 * turns into stacked rows; it stays a table for assistive technology.
 */
export function QueueTable({ rows, label }: { rows: QueueRow[]; label: string }) {
  const t = useT().kelolaEditor.table;
  const { locale, number } = useFormat();
  return (
    <table aria-label={label} className="w-full border-collapse text-sm max-sm:block">
      <thead className="max-sm:sr-only">
        <tr className="border-b border-line">
          <th scope="col" className={th}>
            {t.work}
          </th>
          <th scope="col" className={th}>
            {t.status}
          </th>
          <th scope="col" className={`${th} text-right`}>
            {t.words}
          </th>
          <th scope="col" className={th}>
            {t.waitingSince}
          </th>
          <th scope="col" className={th}>
            {t.revisions}
          </th>
        </tr>
      </thead>
      <tbody className="max-sm:block">
        {rows.map((row) => (
          <tr
            key={row.id}
            className="min-h-11 border-b border-line max-sm:grid max-sm:gap-0.5 max-sm:py-3"
          >
            <td className={`${td} min-w-0 sm:max-w-80`}>
              <Link
                href={reviewHref(row.id)}
                className="block font-medium wrap-anywhere text-ink no-underline hover:underline"
              >
                {row.title}
              </Link>
              <span className="block text-xs wrap-anywhere text-ink-muted">{row.projectTitle}</span>
            </td>
            <td className={td}>
              <StatusSubmission status={row.status} filled />
            </td>
            <td className={`${td} tabular-nums sm:text-right`}>{row.size}</td>
            <td className={`${td} text-ink-muted`}>
              <span className="sm:hidden">{t.waitingSincePrefix}</span>
              {sentAtText(row.since, locale)}
            </td>
            <td
              className={`${td} text-ink-muted tabular-nums ${row.revisions === 0 ? "max-sm:hidden" : ""}`}
            >
              <span className="sm:hidden">{t.revisionsPrefix}</span>
              {row.revisions > 0
                ? fill(t.revisionsOf, { n: number(row.revisions), max: number(MAX_REVISIONS) })
                : "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
