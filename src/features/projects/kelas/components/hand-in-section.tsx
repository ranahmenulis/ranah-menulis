import { Notice } from "@/components/ui/states";
import type { StudioDocument } from "@/features/studio/storage/document-store";
import { Section } from "../../components/category-blocks";
import type { AssignmentForm } from "../assignment-model";
import type { HandInResult } from "../assignment-flow";
import type { AssignmentRow } from "../class-model";
import { AssignmentFormScreen } from "./assignment-form";

type Props = {
  row: AssignmentRow;
  docs: StudioDocument[];
  onSend: (form: AssignmentForm) => Promise<HandInResult>;
};

/**
 * The form that fits where the assignment stands: the first hand-in, a late one (accepted and
 * marked [usulan, Q-27]), or a repair the mentor asked for. Nothing for the other states.
 */
export function HandInSection({ row, docs, onSend }: Props) {
  const { submission, state } = row;
  const repairing = state === "perlu-perbaikan";
  if (state !== "belum-dikumpulkan" && state !== "terlambat" && !repairing) return null;
  const label = repairing ? "Kumpulkan perbaikan" : "Kumpulkan tugas";
  return (
    <Section title={label}>
      {state === "terlambat" && (
        <Notice>
          Tenggat sudah lewat. Tugasmu tetap diterima dan ditandai terlambat; mentor yang
          menilainya.
        </Notice>
      )}
      <AssignmentFormScreen
        key={`${submission?.versions.length ?? 0}-${state}`}
        docs={docs}
        submitLabel={label}
        onSend={onSend}
      />
    </Section>
  );
}

/** Said right after a hand-in, in a live region. Named by what was sent, not by the new status. */
export function JustSentNotice({ kind }: { kind: "tugas" | "perbaikan" }) {
  return (
    <div role="status">
      <Notice>
        {kind === "perbaikan" ? "Perbaikanmu" : "Tugasmu"} terkirim. Mentor akan membacanya dan
        memberi catatan.
      </Notice>
    </div>
  );
}
