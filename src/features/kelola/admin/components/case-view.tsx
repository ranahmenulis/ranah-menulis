"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorBanner, RetryButton, Skeleton } from "@/components/ui/states";
import type { PostStore } from "@/features/community/storage/post-store";
import type { Decision } from "@/features/community/moderation/report-store";
import { sentAtText } from "@/features/projects/submission-text";
import { BackShell } from "../../components/back-shell";
import { ReasonDialog } from "../../components/reason-dialog";
import { REASON_EMPTY, type AdminResult } from "../admin-actions";
import { decideCase } from "../moderation/moderation-actions";
import {
  MODERATION_HREF,
  allowedDecisions,
  decisionLabel,
  decisionNeedsReason,
  stateLabel,
} from "../moderation/moderation-model";
import { useCase } from "../moderation/use-moderation-data";
import { CaseContentSection, CaseReasonsSection } from "./case-sections";

const hint: Record<Decision, string> = {
  abaikan: "Laporan ditutup dan konten tetap tampil.",
  sembunyikan: "Konten hilang dari semua daftar dan bisa dipulihkan. Tercatat di log.",
  hapus: "Konten dihapus dan tidak bisa dipulihkan. Tercatat di log.",
  pulihkan: "Konten tampil lagi. Tercatat di log.",
  tangguhkan: "Akun penulis ditangguhkan dan rolenya berhenti berlaku. Tercatat di log.",
};

/** One reported content with what a moderator may do. The result is said in the status line. */
export function CaseView({ caseKey, store }: { caseKey: string; store?: PostStore }) {
  const state = useCase(caseKey, store);
  const [ask, setAsk] = useState<Decision | null>(null);
  const [said, setSaid] = useState<AdminResult | null>(null);
  const status = useRef<HTMLParagraphElement>(null);
  const back = { href: MODERATION_HREF, label: "Antrean moderasi" };

  if (state.status === "loading") {
    return (
      <BackShell back={back}>
        <div role="status" aria-label="Memuat laporan" className="grid gap-3">
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
          Laporan belum bisa dibuka karena data di perangkat ini tidak terbaca.
        </ErrorBanner>
      </BackShell>
    );
  }
  if (state.status === "gone") {
    return (
      <BackShell back={back}>
        <EmptyState>Laporan ini tidak ditemukan.</EmptyState>
      </BackShell>
    );
  }

  const { row, content } = state;
  const decisions = allowedDecisions(row.state).filter(
    (d) => d !== "tangguhkan" || content !== null,
  );

  function confirm(reason: string) {
    if (!ask || !content) return;
    const result = decideCase(row.kind, row.targetId, content.authorId, ask, reason);
    setSaid(result);
    setAsk(null);
    requestAnimationFrame(() => status.current?.focus());
  }

  return (
    <BackShell back={back}>
      <header className="grid gap-1">
        <h1 className="heading-lg">
          {row.kind === "post" ? "Tulisan dilaporkan" : "Komentar dilaporkan"}
        </h1>
        <p className="text-sm text-ink-muted">
          {stateLabel[row.state]} · {row.status === "baru" ? "Laporan baru" : "Selesai"} ·{" "}
          {row.reports} laporan
        </p>
      </header>
      <p
        ref={status}
        role="status"
        tabIndex={-1}
        className={`min-h-5 text-sm outline-none ${said && !said.ok ? "text-danger" : ""}`}
      >
        {said?.message}
      </p>
      <CaseContentSection kind={row.kind} content={content} />
      <CaseReasonsSection reasons={row.reasons} />
      {row.last && (
        <p className="text-sm text-ink-muted">
          Keputusan terakhir: {decisionLabel[row.last.decision]}, {sentAtText(row.last.at)}
          {row.last.reason ? ` · ${row.last.reason}` : ""}
        </p>
      )}
      <section aria-labelledby="putusan-title" className="grid gap-3">
        <h2 id="putusan-title" className="heading-md">
          Keputusan
        </h2>
        <div className="flex flex-wrap gap-3">
          {decisions.map((d) => (
            <Button
              key={d}
              variant={d === "hapus" || d === "tangguhkan" ? "danger-text" : "secondary"}
              onClick={() => setAsk(d)}
            >
              {decisionLabel[d]}
            </Button>
          ))}
        </div>
      </section>
      {ask && (
        <ReasonDialog
          title={decisionLabel[ask]}
          hint={hint[ask]}
          required={decisionNeedsReason(ask)}
          emptyMessage={REASON_EMPTY}
          confirmLabel={decisionLabel[ask]}
          busy={false}
          onConfirm={confirm}
          onClose={() => setAsk(null)}
        />
      )}
    </BackShell>
  );
}
