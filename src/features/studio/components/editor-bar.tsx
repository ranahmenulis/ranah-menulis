"use client";

import { ArrowsOut, Lightbulb } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Monogram } from "@/components/ui/logo";
import { Menu, type MenuEntry } from "@/components/ui/menu";
import { VisibilityTag } from "@/components/ui/visibility-tag";
import type { DailyLog } from "../daily-progress";
import type { SaveStatus } from "../hooks/use-studio-document";
import { SaveIndicator } from "./save-indicator";
import { TargetIndicator } from "./target-indicator";

/** [konfirmasi] Back-link target until the Studio document list exists (step 4). */
const STUDIO_HOME = "/";

type EditorBarProps = {
  title: string;
  words: number;
  status: SaveStatus;
  savedAt: Date | null;
  offline: boolean;
  progress: DailyLog;
  helpOpen: boolean;
  /** Nothing written yet: sharing has nothing to share. */
  empty: boolean;
  /** False while loading or when the document did not open: no counts or save state to show. */
  ready: boolean;
  /** Name shown in place of the title when the document is not ready. */
  fallbackTitle: string;
  menuItems: MenuEntry[];
  onToggleHelp: () => void;
  onFocusMode: () => void;
};

/**
 * Editor bar (DESIGN.md 6.3). One DOM for both layouts: on phones it wraps into two rows (title and
 * actions, then visibility, save state, counts) because 390px fits only four controls; from md up
 * it is a single 56px row. Help and focus mode move into the ⋯ menu on phones.
 */
export function EditorBar({
  title,
  words,
  status,
  savedAt,
  offline,
  progress,
  helpOpen,
  empty,
  ready,
  fallbackTitle,
  menuItems,
  onToggleHelp,
  onFocusMode,
}: EditorBarProps) {
  return (
    <header className="relative z-40 flex flex-none flex-wrap items-center gap-x-2 border-b border-line bg-canvas pr-2 pl-4 md:h-14 md:flex-nowrap md:gap-x-4 md:px-4">
      <Monogram
        href={STUDIO_HOME}
        label="Kembali ke Studio"
        height={20}
        className="order-1 md:order-1"
      />
      <span className="order-2 min-w-0 flex-1 truncate text-sm font-medium max-md:ml-2 md:order-2 md:max-w-85 md:flex-none">
        {ready ? title.trim() || "Tanpa judul" : fallbackTitle}
      </span>
      <Button
        size="sm"
        disabled
        title="Berbagi tersedia setelah Community dibuka"
        className="order-3 md:order-6"
      >
        Bagikan
      </Button>
      <Menu label="Menu dokumen" items={menuItems} className="order-4 md:order-7" />
      <span aria-hidden className="order-5 basis-full md:hidden" />

      {!ready && <span aria-hidden className="order-6 flex-1 md:order-4" />}
      {ready && (
        <>
          <div className="order-6 flex min-w-0 items-center gap-3 pb-2 md:order-3 md:gap-4 md:pb-0">
            <VisibilityTag visibility="pribadi" />
            <SaveIndicator status={empty ? "draft" : status} savedAt={savedAt} offline={offline} />
          </div>

          <div className="order-7 ml-auto flex items-center gap-3 pb-2 md:order-4 md:pb-0">
            <span className="text-xs text-ink-muted tabular-nums">
              {words.toLocaleString("id-ID")} kata
            </span>
            <TargetIndicator progress={progress} pending={offline} />
          </div>
        </>
      )}

      <IconButton
        label="Bantuan menulis"
        aria-pressed={helpOpen}
        onClick={onToggleHelp}
        className="max-md:hidden md:order-5"
      >
        <Lightbulb size={20} aria-hidden />
      </IconButton>
      <IconButton label="Mode fokus" onClick={onFocusMode} className="max-md:hidden md:order-8">
        <ArrowsOut size={20} aria-hidden />
      </IconButton>
    </header>
  );
}
