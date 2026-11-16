"use client";

import {
  ArrowsOut,
  DownloadSimple,
  Lightbulb,
  PaperPlaneTilt,
  Trash,
} from "@phosphor-icons/react/dist/ssr";
import { useMemo } from "react";
import type { MenuEntry } from "@/components/ui/menu";

type Actions = {
  /** Nothing is stored yet, so there is nothing to move to Sampah. */
  canTrash: boolean;
  /** Nothing to send until the document has text. */
  canSend: boolean;
  onHelp: () => void;
  onFocus: () => void;
  onSend: () => void;
  onTrash: () => void;
};

/** The ⋯ menu of the editor bar (DESIGN.md 6.3). Help and focus mode only appear on phones. */
export function useEditorMenu({ canTrash, canSend, onHelp, onFocus, onSend, onTrash }: Actions) {
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
      { id: "sep-mobile", type: "separator", mobileOnly: true },
      {
        id: "send",
        label: "Kirim ke proyek",
        icon: <PaperPlaneTilt />,
        disabled: !canSend,
        onSelect: onSend,
      },
      {
        // Export is not decided yet (STD-07).
        id: "export",
        label: "Ekspor",
        icon: <DownloadSimple />,
        hint: "Segera",
        disabled: true,
        onSelect: () => {},
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
    [canTrash, canSend, onHelp, onFocus, onSend, onTrash],
  );
}
