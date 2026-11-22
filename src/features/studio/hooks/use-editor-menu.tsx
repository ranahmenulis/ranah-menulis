"use client";

import {
  ArrowsOut,
  ClockCounterClockwise,
  DownloadSimple,
  FileText,
  Lightbulb,
  PaperPlaneTilt,
  Target,
  Timer,
  Trash,
} from "@phosphor-icons/react/dist/ssr";
import { useMemo } from "react";
import type { MenuEntry } from "@/components/ui/menu";
import { useT } from "@/lib/i18n/provider";

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
  onPageLayout: () => void;
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
  onPageLayout,
  onSprint,
  onTrash,
}: Actions) {
  const copy = useT();
  const t = copy.studioLayout.pageLayout;
  const m = copy.studioEditor.menu;
  return useMemo<MenuEntry[]>(
    () => [
      {
        id: "help",
        label: m.help,
        icon: <Lightbulb />,
        mobileOnly: true,
        onSelect: onHelp,
      },
      {
        id: "focus",
        label: m.focus,
        icon: <ArrowsOut />,
        mobileOnly: true,
        onSelect: onFocus,
      },
      {
        id: "sprint",
        label: m.sprint,
        icon: <Timer />,
        mobileOnly: true,
        onSelect: onSprint,
      },
      { id: "sep-mobile", type: "separator", mobileOnly: true },
      {
        id: "send",
        label: m.send,
        icon: <PaperPlaneTilt />,
        disabled: !canSend,
        onSelect: onSend,
      },
      {
        id: "history",
        label: m.history,
        icon: <ClockCounterClockwise />,
        hint: m.historyHint,
        disabled: !canHistory,
        onSelect: onHistory,
      },
      {
        id: "targets",
        label: m.targets,
        icon: <Target />,
        disabled: !canTarget,
        onSelect: onTargets,
      },
      {
        id: "page-layout",
        label: t.menu,
        icon: <FileText />,
        hint: t.menuHint,
        onSelect: onPageLayout,
      },
      {
        id: "export",
        label: m.export,
        icon: <DownloadSimple />,
        hint: m.exportHint,
        disabled: !canExport,
        onSelect: onExport,
      },
      { id: "sep", type: "separator" },
      {
        // Reversible, so ink and not red (DESIGN.md 4.1).
        id: "trash",
        label: m.trash,
        icon: <Trash />,
        hint: canTrash ? m.trashHint : undefined,
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
      onPageLayout,
      onSprint,
      onTrash,
      t,
      m,
    ],
  );
}
