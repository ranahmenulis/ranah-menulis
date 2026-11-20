"use client";

import { Monogram } from "@/components/ui/logo";
import { VisibilityTag } from "@/components/ui/visibility-tag";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/provider";
import { reached, useLoopTime } from "../../motion/use-loop";

const WORDS_BEFORE_TAIL = 163;

// One subject per cycle: the last sentence is written, then saved (times in ms inside the cycle).
const TYPE_FROM = 150;
const TYPE_MS = 1100;
const SAVED_AT = 1650;

function typedChars(time: number | null, length: number): number {
  if (time === null || time < TYPE_FROM) return length;
  const share = (time - TYPE_FROM) / TYPE_MS;
  return Math.min(length, Math.max(0, Math.round(share * length)));
}

function wordsIn(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function EditorPreview() {
  const { hero, doc } = useT().landing;
  const BASE = doc.editorBase;
  const TAIL = doc.editorTail;
  const time = useLoopTime();
  const resetting = time !== null && time < TYPE_FROM;
  const chars = typedChars(time, TAIL.length);
  const typing = time !== null && !resetting && time < TYPE_FROM + TYPE_MS;
  const saved = reached(time, SAVED_AT);
  const words = WORDS_BEFORE_TAIL + wordsIn(TAIL.slice(0, chars));

  return (
    <>
      <div className="flex h-14 items-center gap-4 border-b border-line px-4">
        <Monogram height={20} />
        <span className="hidden max-w-[220px] truncate text-sm font-medium md:inline">
          {doc.title}
        </span>
        <VisibilityTag visibility="pribadi" />
        <span className="text-xs text-ink-muted">{saved ? hero.saved : hero.saving}</span>
        <span className="ml-auto text-xs text-ink-muted tabular-nums">
          {words} {hero.words}
        </span>
      </div>
      <div className="px-4 py-5 md:p-7">
        {/* The Studio section right below shows the full page, so a phone skips the repeated title. */}
        <p className="mb-4 font-serif text-[28px] leading-9 font-semibold tracking-[-0.015em] max-md:hidden">
          {doc.title}
        </p>
        <p className="font-serif text-[15px] leading-[25px] md:text-lg md:leading-[29px]">
          {BASE}
          <span
            className={cn("transition-opacity duration-150 ease-out", resetting && "opacity-40")}
          >
            {TAIL.slice(0, chars)}
          </span>
          {typing && (
            <span className="-mb-[0.15em] ml-px inline-block h-[1.1em] w-[1.5px] animate-[lp-blink_1s_steps(1)_infinite] bg-ink align-baseline" />
          )}
        </p>
      </div>
    </>
  );
}
