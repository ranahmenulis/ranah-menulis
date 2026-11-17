"use client";

import {
  ArrowsOut,
  ClockCounterClockwise,
  DownloadSimple,
  Lightbulb,
  PaperPlaneTilt,
  Target,
  Timer,
  Trash,
} from "@phosphor-icons/react/dist/ssr";
import { useMemo } from "react";
import type { MenuEntry } from "@/components/ui/menu";

type Actions = {
  /** Nothing is stored yet, so there is nothing to move to Sampah. */
  canTrash: boolean;
  /** Nothing to send until the document has text. */
  canSend: boolean;
  /** Nothing to export until the document has text. */
  canExport: boolean;
  /** Targets need a stored document, so an empty draft cannot have any. */
  canTarget: boolean;
  /** Versions belong to a stored document, so an empty draft has none. */
  canHistory: boolean;
  onHelp: () => void;
  onFocus: () => void;
  onSend: () => void;
  onExport: () => void;
  onHistory: () => void;
  onTargets: () => void;
  onSprint: () => void;
  onTrash: () => void;
};

/** The ⋯ menu of the editor bar (DESIGN.md 6.3). Help and focus mode only appear on phones. */
export function useEditorMenu({
  canTrash,
  canSend,
  canExport,
  canTarget,
  canHistory,
  onHelp,
  onFocus,
  onSend,
  onExport,
  onHistory,
  onTargets,
  onSprint,
  onTrash,
}: Actions) {
  return useMemo<MenuEntry[]>(
    () => [
      {
        id: "help",
        label: "Bantuan menulis",
        icon: <Lightbulb />,
        mobileOnly: true,
        onSelect: onHelp,
      },
      {
        id: "focus",
        label: "Mode fokus",
        icon: <ArrowsOut />,
        mobileOnly: true,
        onSelect: onFocus,
      },
      {
        id: "sprint",
        label: "Timer sprint",
        icon: <Timer />,
        mobileOnly: true,
        onSelect: onSprint,
      },
      { id: "sep-mobile", type: "separator", mobileOnly: true },
      {
        id: "send",
        label: "Kirim ke proyek",
        icon: <PaperPlaneTilt />,
        disabled: !canSend,
        onSelect: onSend,
      },
      {
        id: "history",
        label: "Riwayat versi",
        icon: <ClockCounterClockwise />,
        hint: "3 hari",
        disabled: !canHistory,
        onSelect: onHistory,
      },
      {
        id: "targets",
        label: "Target dokumen",
        icon: <Target />,
        disabled: !canTarget,
        onSelect: onTargets,
      },
      {
        id: "export",
        label: "Ekspor",
        icon: <DownloadSimple />,
        hint: "TXT, PDF",
        disabled: !canExport,
        onSelect: onExport,
      },
      { id: "sep", type: "separator" },
      {
        // Reversible, so ink and not red (DESIGN.md 4.1).
        id: "trash",
        label: "Pindah ke sampah",
        icon: <Trash />,
        hint: canTrash ? "Bisa dipulihkan" : undefined,
        disabled: !canTrash,
        onSelect: onTrash,
      },
    ],
    [
      canTrash,
      canSend,
      canExport,
      canTarget,
      canHistory,
      onHelp,
      onFocus,
      onSend,
      onExport,
      onHistory,
      onTargets,
      onSprint,
      onTrash,
    ],
  );
}
