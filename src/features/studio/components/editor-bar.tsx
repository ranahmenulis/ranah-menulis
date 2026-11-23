"use client";

import { ArrowLeft, ArrowsOut, Lightbulb, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { IconButton } from "@/components/ui/icon-button";
import { Menu, type MenuEntry } from "@/components/ui/menu";
import { VisibilityTag } from "@/components/ui/visibility-tag";
import { useT } from "@/lib/i18n/provider";
import type { DailyLog } from "../daily-progress";
import type { EditorStats } from "../editor-stats";
import type { SaveStatus } from "../hooks/use-studio-document";
import type { SprintApi } from "../hooks/use-sprint";
import type { WordCountTarget } from "../word-count-pin";
import { SaveIndicator } from "./save-indicator";
import { SprintControl } from "./sprint-control";
import { TargetIndicator } from "./target-indicator";
import { WordCount } from "./word-count";

type EditorBarProps = {
  title: string;
  words: number;
  /** Characters and paragraphs of the text; `null` until the editor has opened it. */
  stats: EditorStats | null;
  /** Counts for the selected text, or `null` while nothing is selected. */
  selection: EditorStats | null;
  status: SaveStatus;
  savedAt: Date | null;
  offline: boolean;
  progress: DailyLog;
  target: number;
  helpOpen: boolean;
  /** Nothing written yet: the save state reads "draft". */
  empty: boolean;
  /** False while loading or when the document did not open: no counts or save state to show. */
  ready: boolean;
  /** Name shown in place of the title when the document is not ready. */
  fallbackTitle: string;
  menuItems: MenuEntry[];
  counterTarget: WordCountTarget | null | undefined;
  sprint: SprintApi;
  sprintOpen: boolean;
  onSprintOpenChange: (open: boolean) => void;
  /** Back to the document list; the screen saves first so nothing written is left behind. */
  onBack: () => void;
  onSearch?: () => void;
  onToggleHelp: () => void;
  onFocusMode: () => void;
};

/**
 * Editor bar (DESIGN.md 6.3). One DOM for both layouts: on phones it wraps into two rows (title and
 * actions, then visibility, save state, counts); from md up
 * it is a single 56px row. Help and focus mode move into the ⋯ menu on phones.
 */
export function EditorBar({
  title,
  words,
  stats,
  selection,
  status,
  savedAt,
  offline,
  progress,
  target,
  helpOpen,
  empty,
  ready,
  fallbackTitle,
  menuItems,
  counterTarget,
  sprint,
  sprintOpen,
  onSprintOpenChange,
  onBack,
  onSearch,
  onToggleHelp,
  onFocusMode,
}: EditorBarProps) {
  const t = useT().studioEditor;
  return (
    <header className="relative z-40 flex flex-none flex-wrap items-center gap-x-2 border-b border-line bg-surface pt-(--safe-top) pr-2 pl-4 md:h-[calc(3.5rem+var(--safe-top))] md:flex-nowrap md:gap-x-4 md:px-4">
      <IconButton label={t.bar.back} onClick={onBack} className="order-1 -ml-2 md:-ml-1">
        <ArrowLeft size={20} aria-hidden />
      </IconButton>
      <span className="order-2 min-w-0 flex-1 truncate text-sm font-medium md:order-2 md:max-w-85 md:flex-none">
        {ready ? title.trim() || t.bar.untitled : fallbackTitle}
      </span>
      {onSearch && (
        <IconButton
          label={t.bar.search}
          aria-haspopup="dialog"
          aria-keyshortcuts="Control+K Meta+K"
          onClick={onSearch}
          className="order-3 shrink-0 md:order-6"
        >
          <MagnifyingGlass size={20} aria-hidden />
        </IconButton>
      )}
      <Menu label={t.bar.menu} items={menuItems} className="order-4 md:order-7" />
      <span aria-hidden className="order-5 basis-full md:hidden" />

      {!ready && <span aria-hidden className="order-6 flex-1 md:order-4" />}
      {ready && (
        <>
          <div className="order-6 flex min-w-0 items-center gap-3 pb-2 md:order-3 md:gap-4 md:pb-0">
            <VisibilityTag visibility="pribadi" />
            <SaveIndicator status={empty ? "draft" : status} savedAt={savedAt} offline={offline} />
          </div>

          <div className="order-7 ml-auto flex items-center gap-3 pb-2 max-md:max-w-full max-md:flex-wrap max-md:justify-end max-md:gap-x-2 max-md:gap-y-0 md:order-4 md:pb-0">
            <SprintControl
              sprint={sprint}
              words={words}
              open={sprintOpen}
              onOpenChange={onSprintOpenChange}
            />
            <WordCount
              words={words}
              stats={stats}
              selection={selection}
              sprint={sprint.state}
              target={counterTarget}
            />
            <TargetIndicator progress={progress} target={target} pending={offline} />
          </div>
        </>
      )}

      <IconButton
        label={t.bar.help}
        aria-pressed={helpOpen}
        onClick={onToggleHelp}
        className="max-md:hidden md:order-5"
      >
        <Lightbulb size={20} aria-hidden />
      </IconButton>
      <IconButton label={t.bar.focus} onClick={onFocusMode} className="max-md:hidden md:order-8">
        <ArrowsOut size={20} aria-hidden />
      </IconButton>
    </header>
  );
}
