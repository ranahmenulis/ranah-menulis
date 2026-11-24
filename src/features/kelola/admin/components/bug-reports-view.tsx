"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/states";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import {
  BUG_FILTERS,
  BUG_REPORTS_HREF,
  applyBugFilter,
  bugFilterQuery,
  bugReportHref,
  bugRows,
  countBugs,
  excerptOf,
  parseBugFilter,
  type BugFilter,
} from "@/features/support/bug-report-model";
import { useBugReportLog, useBugReports } from "@/features/support/bug-report-store";
import { sentAtText } from "@/features/projects/submission-text";
import { listCardClass } from "../../components/list-card";
import { useUrlFilter } from "../../use-url-filter";
import { personLabel } from "../people";

/**
 * Problem reports from users. The filter lives in the address and opens on "Baru". Unlike content
 * reports, the reporter is shown: an Administrator has to be able to ask what happened.
 */
export function BugReportsView() {
  const t = useT().support.admin;
  const locale = useLocale();
  const reports = useBugReports();
  const log = useBugReportLog();
  const [filter, change] = useUrlFilter(
    "status",
    parseBugFilter,
    (f: BugFilter) => `${BUG_REPORTS_HREF}${bugFilterQuery(f)}`,
  );

  const rows = useMemo(() => bugRows(reports, log), [reports, log]);
  const counts = useMemo(() => countBugs(rows), [rows]);
  const shown = useMemo(() => applyBugFilter(rows, filter), [rows, filter]);

  return (
    <section aria-labelledby="laporan-title" className="grid gap-5">
      <div className="grid gap-1">
        <h1 id="laporan-title" className="heading-lg">
          {t.title}
        </h1>
        <p className="text-sm text-ink-muted">{t.intro}</p>
      </div>
      <div role="group" aria-label={t.filterLabel} className="flex flex-wrap gap-2">
        {BUG_FILTERS.map((f) => (
          <Chip key={f} pressed={f === filter} onClick={() => change(f)}>
            {t.filters[f]} <span className="ml-1.5 tabular-nums">{counts[f]}</span>
          </Chip>
        ))}
      </div>
      {shown.length === 0 ? (
        <EmptyState
          action={
            filter !== "semua" && rows.length > 0 ? (
              <Button variant="text" onClick={() => change("semua")}>
                {t.viewAll}
              </Button>
            ) : undefined
          }
        >
          {t.empty[filter]}
        </EmptyState>
      ) : (
        <ul aria-label={t.listLabel} className={listCardClass}>
          {shown.map(({ report, status }) => (
            <li key={report.id} className="border-b border-line">
              <Link
                href={bugReportHref(report.id)}
                className="grid gap-0.5 py-3 no-underline hover:bg-subtle"
              >
                <span className="font-medium wrap-anywhere text-ink">
                  {excerptOf(report.description, 90)}
                  <span className="font-normal text-ink-muted"> · {t.status[status]}</span>
                </span>
                <span className="text-xs text-ink-muted">
                  {format(t.summary, {
                    reporter: personLabel(report.reporterId, locale),
                    when: sentAtText(report.at, locale),
                  })}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
