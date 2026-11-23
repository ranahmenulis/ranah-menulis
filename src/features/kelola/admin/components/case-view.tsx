"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { EmptyState, ErrorBanner, RetryButton, Skeleton } from "@/components/ui/states";
import type { PostStore } from "@/features/community/storage/post-store";
import type { Decision } from "@/features/community/moderation/report-store";
import { sentAtText } from "@/features/projects/submission-text";
import { BackShell } from "../../components/back-shell";
import { ReasonDialog } from "../../components/reason-dialog";
import type { AdminResult } from "../admin-actions";
import { adminMessage } from "../copy/admin-copy";
import { decideCase } from "../moderation/moderation-actions";
import {
  MODERATION_HREF,
  allowedDecisions,
  decisionNeedsReason,
} from "../moderation/moderation-model";
import { useCase } from "../moderation/use-moderation-data";
import { CaseContentSection, CaseReasonsSection } from "./case-sections";

/** One reported content with what a moderator may do. The result is said in the status line. */
export function CaseView({ caseKey, store }: { caseKey: string; store?: PostStore }) {
  const t = useT().kelolaModeration;
  const locale = useLocale();
  const state = useCase(caseKey, store);
  const [ask, setAsk] = useState<Decision | null>(null);
  const [said, setSaid] = useState<AdminResult | null>(null);
  const status = useRef<HTMLParagraphElement>(null);
  const back = { href: MODERATION_HREF, label: t.case.back };

  if (state.status === "loading") {
    return (
      <BackShell back={back}>
        <div role="status" aria-label={t.queue.loading} className="grid gap-3">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-32 w-full" />
        </div>
      </BackShell>
    );
  }
  if (state.status === "error") {
    return (
      <BackShell back={back}>
        <ErrorBanner action={<RetryButton onClick={state.reload} />}>
          {t.queue.loadError}
        </ErrorBanner>
      </BackShell>
    );
  }
  if (state.status === "gone") {
    return (
      <BackShell back={back}>
        <EmptyState>{t.case.gone}</EmptyState>
      </BackShell>
    );
  }

  const { row, content } = state;
  const decisions = allowedDecisions(row.state).filter(
    (d) => d !== "tangguhkan" || content !== null,
  );

  function confirm(reason: string) {
    if (!ask) return;
    const result = decideCase(row.kind, row.targetId, ask, reason);
    setSaid(result);
    setAsk(null);
    requestAnimationFrame(() => status.current?.focus());
  }

  return (
    <BackShell back={back}>
      <header className="grid gap-1">
        <h1 className="heading-lg">
          {row.kind === "post" ? t.case.postTitle : t.case.commentTitle}
        </h1>
        <p className="text-sm text-ink-muted">
          {format(t.case.summary, {
            state: t.states[row.state],
            status: row.status === "baru" ? t.case.statusNew : t.case.statusDone,
            reports: String(row.reports),
          })}
        </p>
      </header>
      <p
        ref={status}
        role="status"
        tabIndex={-1}
        className={`min-h-5 text-sm outline-none ${said && !said.ok ? "text-danger" : ""}`}
      >
        {said ? adminMessage(said, locale) : ""}
      </p>
      <CaseContentSection kind={row.kind} content={content} />
      <CaseReasonsSection reasons={row.reasons} />
      {row.last && (
        <p className="text-sm text-ink-muted">
          {format(row.last.reason ? t.case.lastWithReason : t.case.last, {
            decision: t.decisions[row.last.decision],
            when: sentAtText(row.last.at, locale),
            reason: row.last.reason ?? "",
          })}
        </p>
      )}
      <section aria-labelledby="putusan-title" className="grid gap-3">
        <h2 id="putusan-title" className="heading-md">
          {t.case.decisionTitle}
        </h2>
        <div className="flex flex-wrap gap-3">
          {decisions.map((d) => (
            <Button
              key={d}
              variant={d === "hapus" || d === "tangguhkan" ? "danger-text" : "secondary"}
              onClick={() => setAsk(d)}
            >
              {t.decisions[d]}
            </Button>
          ))}
        </div>
      </section>
      {ask && (
        <ReasonDialog
          title={t.decisions[ask]}
          hint={t.hints[ask]}
          required={decisionNeedsReason(ask)}
          emptyMessage={adminMessage({ message: "", code: "reasonEmpty" }, locale)}
          confirmLabel={t.decisions[ask]}
          busy={false}
          onConfirm={confirm}
          onClose={() => setAsk(null)}
        />
      )}
    </BackShell>
  );
}
