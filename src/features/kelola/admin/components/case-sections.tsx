import Link from "next/link";
import type { ReportKind } from "@/features/community/moderation/report-store";
import { authorOf } from "@/features/community/post-model";
import { userHref } from "../area-hrefs";
import { reasonLabel, type CaseContent, type CaseRow } from "../moderation/moderation-model";

export function CaseContentSection({
  kind,
  content,
}: {
  kind: ReportKind;
  content: CaseContent | null;
}) {
  const author = content ? authorOf(content.authorId) : null;
  return (
    <section aria-labelledby="isi-title" className="grid gap-2">
      <h2 id="isi-title" className="heading-md">
        Isi
      </h2>
      {content && author ? (
        <>
          <p className="text-sm text-ink-muted">
            {kind === "post" ? content.title : `Di bawah “${content.title}”`} ·{" "}
            <Link href={userHref(author.id)}>{author.name}</Link>
          </p>
          <p className="read-body wrap-anywhere whitespace-pre-line">{content.text}</p>
          {content.href && (
            <p className="text-sm">
              <Link href={content.href}>Buka dalam konteks</Link>
            </p>
          )}
        </>
      ) : (
        <p className="text-sm text-ink-muted">Konten ini tidak ditemukan lagi.</p>
      )}
    </section>
  );
}

export function CaseReasonsSection({ reasons }: { reasons: CaseRow["reasons"] }) {
  return (
    <section aria-labelledby="alasan-title" className="grid gap-2">
      <h2 id="alasan-title" className="heading-md">
        Alasan laporan
      </h2>
      <ul className="border-t border-line">
        {Object.entries(reasons).map(([reason, count]) => (
          <li key={reason} className="flex justify-between border-b border-line py-2 text-sm">
            <span>{reasonLabel[reason as keyof typeof reasonLabel]}</span>
            <span className="text-ink-muted tabular-nums">{count} laporan</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-ink-muted">Pelapor tidak ditampilkan dan tidak diberi tahu.</p>
    </section>
  );
}
