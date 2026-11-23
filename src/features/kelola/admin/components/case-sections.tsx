import Link from "next/link";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import type { ReportKind } from "@/features/community/moderation/report-store";
import { authorOf } from "@/features/community/post-model";
import type { ReportReason } from "@/features/community/types";
import { userHref } from "../area-hrefs";
import { reportReasonLabel, type CaseContent, type CaseRow } from "../moderation/moderation-model";

export function CaseContentSection({
  kind,
  content,
}: {
  kind: ReportKind;
  content: CaseContent | null;
}) {
  const t = useT().kelolaModeration.case;
  const author = content ? authorOf(content.authorId) : null;
  return (
    <section aria-labelledby="isi-title" className="grid gap-2">
      <h2 id="isi-title" className="heading-md">
        {t.contentTitle}
      </h2>
      {content && author ? (
        <>
          <p className="text-sm text-ink-muted">
            {kind === "post" ? content.title : format(t.under, { title: content.title })} ·{" "}
            <Link href={userHref(author.id)}>{author.name}</Link>
          </p>
          <p className="read-body wrap-anywhere whitespace-pre-line">{content.text}</p>
          {content.href && (
            <p className="text-sm">
              <Link href={content.href}>{t.openInContext}</Link>
            </p>
          )}
        </>
      ) : (
        <p className="text-sm text-ink-muted">{t.contentGone}</p>
      )}
    </section>
  );
}

export function CaseReasonsSection({ reasons }: { reasons: CaseRow["reasons"] }) {
  const t = useT().kelolaModeration.case;
  const locale = useLocale();
  return (
    <section aria-labelledby="alasan-title" className="grid gap-2">
      <h2 id="alasan-title" className="heading-md">
        {t.reasonsTitle}
      </h2>
      <ul className="border-t border-line">
        {Object.entries(reasons).map(([reason, count]) => (
          <li key={reason} className="flex justify-between border-b border-line py-2 text-sm">
            <span>{reportReasonLabel(reason as ReportReason, locale)}</span>
            <span className="text-ink-muted tabular-nums">
              {format(t.reasonCount, { count: String(count) })}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-ink-muted">{t.reporterNote}</p>
    </section>
  );
}
