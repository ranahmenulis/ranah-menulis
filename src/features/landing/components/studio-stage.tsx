"use client";

import type { CSSProperties } from "react";
import { EditorBar } from "@/features/studio/components/editor-bar";
import {
  FormatBarView,
  type FormatState,
} from "@/features/studio/components/format/format-bar-view";
import { ModeSwitch } from "@/features/studio/components/format/mode-switch";
import "@/features/studio/components/editor.css";
import type { DailyLog } from "@/features/studio/daily-progress";
import { DEFAULT_LAYOUT, layoutVars } from "@/features/studio/document-layout";
import type { SprintApi } from "@/features/studio/hooks/use-sprint";
import { useT } from "@/lib/i18n/provider";
import { textStats } from "@/lib/text-stats";

// Today's sample progress: 320 of the default 500-word target, all in this manuscript.
const TODAY_WORDS = 320;
const TARGET = 500;
// The cursor sits at the end of the first paragraph; nothing is selected or toggled.
const FORMAT: FormatState = {
  style: "p",
  align: "left",
  bold: false,
  italic: false,
  quote: false,
  bullets: false,
  numbers: false,
};
const IDLE_SPRINT: SprintApi = {
  state: { phase: "idle" },
  nowMs: 0,
  start: () => {},
  stop: () => {},
  dismiss: () => {},
};
const noop = () => {};

/**
 * The hero's editor (client, 24 Nov 2026: the landing shows the app itself, not a drawing of it).
 * It is the real Studio editor bar, format bar, mode switch and writing surface (`editor.css`,
 * default document layout), fed a sample manuscript. The whole thing is `inert`: it looks live but
 * cannot be clicked or tabbed into, and the figure around it carries the description. A caret
 * blinks after the last word when landing motion is on. The Studio demo will replace the text
 * with a real editor.
 */
export function StudioStage() {
  const { doc } = useT().landing;
  const stats = textStats(doc.page);
  const progress: DailyLog = {
    day: "2026-11-24",
    docs: { sample: { title: doc.title, words: TODAY_WORDS } },
  };

  return (
    <div inert className="flex flex-col bg-surface text-left">
      <EditorBar
        title={doc.title}
        words={stats.words}
        stats={{ words: stats.words, characters: stats.characters, paragraphs: doc.page.length }}
        selection={null}
        status="saved"
        savedAt={null}
        offline={false}
        progress={progress}
        target={TARGET}
        helpOpen={false}
        empty={false}
        ready
        fallbackTitle=""
        menuItems={[]}
        counterTarget={null}
        sprint={IDLE_SPRINT}
        sprintOpen={false}
        onSprintOpenChange={noop}
        onBack={noop}
        onToggleHelp={noop}
        onFocusMode={noop}
      />
      <FormatBarView
        active={FORMAT}
        onCommand={noop}
        trailing={<ModeSwitch mode="write" onChange={noop} />}
      />
      <div className="px-4 pt-8 md:px-12 md:pt-10">
        <article
          className="studio-editor-page mx-auto w-full"
          style={layoutVars(DEFAULT_LAYOUT) as CSSProperties}
        >
          <p className="studio-title mb-6 text-ink-read md:mb-8">{doc.title}</p>
          <div className="studio-prose" style={{ minHeight: 0 }}>
            {doc.page.map((p, i) => (
              <p key={p}>
                {p}
                {i === doc.page.length - 1 && <span aria-hidden className="lp-caret" />}
              </p>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
