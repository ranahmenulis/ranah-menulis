import { ButtonLink } from "@/components/ui/button";
import { RadioChoice } from "@/components/ui/choice";
import { EmptyState } from "@/components/ui/states";
import type { StudioDocument } from "@/features/studio/storage/document-store";
import { formatNumber } from "../project-model";

type Props = {
  docs: StudioDocument[];
  value: string | null;
  onChange: (doc: StudioDocument) => void;
  /** Documents already sent to this project; they cannot be sent again. */
  sentDocIds: ReadonlySet<string>;
  describedBy?: string;
  invalid?: boolean;
};

function hintOf(doc: StudioDocument, sent: boolean): string {
  if (sent) return "Sudah dikirim ke proyek ini";
  if (doc.wordCount === 0) return "Belum ada teks";
  return `${formatNumber(doc.wordCount)} kata`;
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
  if (docs.length === 0) {
    return (
      <EmptyState
        action={
          <ButtonLink href="/studio/baru" variant="secondary">
            Mulai menulis
          </ButtonLink>
        }
      >
        Belum ada dokumen di Studio.
      </EmptyState>
    );
  }
  return (
    <fieldset
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      className="grid max-h-72 gap-3 overflow-auto border border-line p-3"
    >
      <legend className="sr-only">Pilih dokumen</legend>
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
            label={<span className="wrap-anywhere">{doc.title.trim() || "Tanpa judul"}</span>}
            hint={hintOf(doc, sent)}
          />
        );
      })}
    </fieldset>
  );
}
