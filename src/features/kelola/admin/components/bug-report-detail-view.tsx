"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { formatNumber } from "@/lib/i18n/format";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { BUG_REPORTS_HREF, nextStatuses, statusOf } from "@/features/support/bug-report-model";
import { useBugReportLog, useBugReports } from "@/features/support/bug-report-store";
import { sentAtText } from "@/features/projects/submission-text";
import { BackShell } from "../../components/back-shell";
import { ReasonDialog } from "../../components/reason-dialog";
import { setBugStatus, type BugActionResult } from "../reports/bug-report-actions";
import { personLabel } from "../people";

type Step = "diproses" | "selesai";

/** One problem report with what an Administrator may do. The result is said in the status line. */
export function BugReportDetailView({ reportId }: { reportId: string }) {
  const t = useT().support;
  const locale = useLocale();
  const reports = useBugReports();
  const log = useBugReportLog();
  const [ask, setAsk] = useState<Step | null>(null);
  const [said, setSaid] = useState<BugActionResult | null>(null);
  const status = useRef<HTMLParagraphElement>(null);
  const back = { href: BUG_REPORTS_HREF, label: t.admin.back };

  const report = reports.find((r) => r.id === reportId);
  if (!report) {
    return (
      <BackShell back={back}>
        <EmptyState>{t.admin.gone}</EmptyState>
      </BackShell>
    );
  }

  const current = statusOf(log, report.id);
  const steps = nextStatuses(current);
  const history = log.filter((entry) => entry.reportId === report.id);
  const d = t.admin.detail;

  function confirm(note: string) {
    if (!ask) return;
    setSaid(setBugStatus(report!.id, ask, note));
    setAsk(null);
    requestAnimationFrame(() => status.current?.focus());
  }

  const result = said
    ? format(t.admin.results[said.code], { limit: formatNumber(said.limit ?? 0, locale) })
    : "";
  const context = report.context;
  const contextRows: [string, string][] = context
    ? [
        [t.form.contextFields.page, context.path],
        [t.form.contextFields.language, context.language],
        [t.form.contextFields.theme, context.theme],
        [t.form.contextFields.screen, context.screen],
        [t.form.contextFields.browser, context.browser],
      ]
    : [];

  return (
    <BackShell back={back}>
      <header className="grid gap-1">
        <h1 className="heading-lg">{t.admin.title}</h1>
        <p className="text-sm text-ink-muted">
          {format(d.summary, {
            status: t.admin.status[current],
            category: t.form.categories[report.category],
          })}
        </p>
      </header>
      <p
        ref={status}
        role="status"
        tabIndex={-1}
        className={`min-h-5 text-sm outline-none ${said && !said.ok ? "text-danger" : ""}`}
      >
        {result}
      </p>
      <dl className="grid gap-4 text-sm">
        <div className="grid gap-0.5">
          <dt className="text-ink-muted">{d.reporter}</dt>
          <dd>{personLabel(report.reporterId, locale)}</dd>
        </div>
        <div className="grid gap-0.5">
          <dt className="text-ink-muted">{d.sentAt}</dt>
          <dd>{sentAtText(report.at, locale)}</dd>
        </div>
        <div className="grid gap-0.5">
          <dt className="text-ink-muted">{d.description}</dt>
          <dd className="wrap-anywhere whitespace-pre-line">{report.description}</dd>
        </div>
        <div className="grid gap-0.5">
          <dt className="text-ink-muted">{d.steps}</dt>
          <dd className="wrap-anywhere whitespace-pre-line">{report.steps ?? d.stepsNone}</dd>
        </div>
        <div className="grid gap-0.5">
          <dt className="text-ink-muted">{d.context}</dt>
          <dd>
            {context ? (
              <ul className="grid gap-0.5">
                {contextRows.map(([name, value]) => (
                  <li key={name} className="wrap-anywhere">
                    <span className="text-ink-muted">{name}: </span>
                    {value || "—"}
                  </li>
                ))}
              </ul>
            ) : (
              d.contextNone
            )}
          </dd>
        </div>
      </dl>
      <section aria-labelledby="riwayat-laporan" className="grid gap-2">
        <h2 id="riwayat-laporan" className="heading-md">
          {d.history}
        </h2>
        {history.length === 0 ? (
          <p className="text-sm text-ink-muted">{d.historyNone}</p>
        ) : (
          <ul className="grid gap-1 text-sm">
            {history.map((entry) => {
              const line = format(d.historyEntry, {
                status: t.admin.status[entry.status],
                by: personLabel(entry.by, locale),
                when: sentAtText(entry.at, locale),
              });
              return (
                <li key={`${entry.status}-${entry.at}`} className="wrap-anywhere">
                  {entry.note ? format(d.historyNote, { entry: line, note: entry.note }) : line}
                </li>
              );
            })}
          </ul>
        )}
      </section>
      <section aria-labelledby="tindakan-laporan" className="grid gap-3">
        <h2 id="tindakan-laporan" className="heading-md">
          {d.actionsTitle}
        </h2>
        {steps.length === 0 ? (
          <p className="text-sm text-ink-muted">{d.noActions}</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {steps.map((step) => (
              <Button
                key={step}
                variant={step === "selesai" ? "primary" : "secondary"}
                onClick={() => setAsk(step)}
              >
                {t.admin.actions[step]}
              </Button>
            ))}
          </div>
        )}
      </section>
      {ask && (
        <ReasonDialog
          title={t.admin.actions[ask]}
          hint={t.admin.hints[ask]}
          fieldLabel={t.admin.noteLabel}
          required={false}
          confirmLabel={t.admin.actions[ask]}
          busy={false}
          onConfirm={confirm}
          onClose={() => setAsk(null)}
        />
      )}
    </BackShell>
  );
}
