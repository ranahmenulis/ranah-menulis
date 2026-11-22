"use client";

import { Notice } from "@/components/ui/states";
import { fill } from "@/features/studio/copy/fill";
import { useT } from "@/lib/i18n/provider";
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
  const t = useT().projectsClass.handIn;
  const { submission, state } = row;
  const repairing = state === "perlu-perbaikan";
  if (state !== "belum-dikumpulkan" && state !== "terlambat" && !repairing) return null;
  const label = repairing ? t.repair : t.submit;
  return (
    <Section title={label}>
      {state === "terlambat" && <Notice>{t.lateNotice}</Notice>}
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
  const t = useT().projectsClass.handIn;
  return (
    <div role="status">
      <Notice>{fill(t.sent, { what: kind === "perbaikan" ? t.whatRepair : t.whatTask })}</Notice>
    </div>
  );
}
