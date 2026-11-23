import { bookChapterCount, isBookDocId } from "@/features/studio/book-source";
import { fill } from "@/features/studio/copy/fill";
import { formatNumber } from "@/lib/i18n/format";
import { useLocale, useT } from "@/lib/i18n/provider";
import { ButtonLink } from "@/components/ui/button";
import { RadioChoice } from "@/components/ui/choice";
import { EmptyState } from "@/components/ui/states";
import type { StudioDocument } from "@/features/studio/storage/document-store";

type Props = {
  docs: StudioDocument[];
  value: string | null;
  onChange: (doc: StudioDocument) => void;
  /** Documents already sent to this project; they cannot be sent again. */
  sentDocIds: ReadonlySet<string>;
  describedBy?: string;
  invalid?: boolean;
};

type Text = ReturnType<typeof useT>["projectsFlow"]["submit"]["picker"];

function hintOf(doc: StudioDocument, sent: boolean, t: Text, locale: "id" | "en"): string {
  if (sent) return t.alreadySent;
  if (doc.wordCount === 0) return t.noText;
  const n = formatNumber(doc.wordCount, locale);
  if (!isBookDocId(doc.id)) return fill(t.words, { n });
  return fill(t.bookWords, { n, chapters: formatNumber(bookChapterCount(doc), locale) });
}

/**
 * One document of the Studio, chosen as the work (PRD 10.5, step 3). Documents with no text or
 * already sent here are listed but cannot be picked, so it is clear why they are missing.
 */
export function SubmitDocumentPicker({
  docs,
  value,
  onChange,
  sentDocIds,
  describedBy,
  invalid,
}: Props) {
  const flow = useT().projectsFlow;
  const t = flow.submit.picker;
  const locale = useLocale();
  if (docs.length === 0) {
    return (
      <EmptyState
        action={
          <ButtonLink href="/studio/baru" variant="secondary">
            {t.start}
          </ButtonLink>
        }
      >
        {t.empty}
      </EmptyState>
    );
  }
  return (
    <fieldset
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      className="grid max-h-72 gap-3 overflow-auto rounded-xl border border-line p-3"
    >
      <legend className="sr-only">{t.legend}</legend>
      {docs.map((doc) => {
        const sent = sentDocIds.has(doc.id);
        return (
          <RadioChoice
            key={doc.id}
            name="dokumen"
            value={doc.id}
            checked={value === doc.id}
            disabled={sent || doc.wordCount === 0}
            onChange={() => onChange(doc)}
            label={
              <span className="wrap-anywhere">{doc.title.trim() || flow.common.untitled}</span>
            }
            hint={hintOf(doc, sent, t, locale)}
          />
        );
      })}
    </fieldset>
  );
}
