"use client";

import { Monogram } from "@/components/ui/logo";
import { VisibilityTag } from "@/components/ui/visibility-tag";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/provider";
import { heroDoc } from "../../copy/doc";
import { reached, useLoopTime } from "../../motion/use-loop";

const BASE =
  "Ada orang yang menunggu dengan duduk di beranda, memandangi ujung jalan sampai matanya perih.";
const TAIL = " Nenek menunggu dengan basah.";
const WORDS_BEFORE_TAIL = 163;

// One subject per cycle: the last sentence is written, then saved (times in ms inside the cycle).
const TYPE_FROM = 150;
const TYPE_MS = 1100;
const SAVED_AT = 1650;

function typedChars(time: number | null): number {
  if (time === null || time < TYPE_FROM) return TAIL.length;
  const share = (time - TYPE_FROM) / TYPE_MS;
  return Math.min(TAIL.length, Math.max(0, Math.round(share * TAIL.length)));
}

function wordsIn(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function EditorPreview() {
  const { hero } = useT().landing;
  const time = useLoopTime();
  const resetting = time !== null && time < TYPE_FROM;
  const chars = typedChars(time);
  const typing = time !== null && !resetting && time < TYPE_FROM + TYPE_MS;
  const saved = reached(time, SAVED_AT);
  const words = WORDS_BEFORE_TAIL + wordsIn(TAIL.slice(0, chars));

  return (
    <>
      <div className="flex h-14 items-center gap-4 border-b border-line px-4">
        <Monogram height={20} />
        <span className="hidden max-w-[220px] truncate text-sm font-medium md:inline">
          {heroDoc.title}
        </span>
        <VisibilityTag visibility="pribadi" />
        <span className="text-xs text-ink-muted">{saved ? hero.saved : hero.saving}</span>
        <span className="ml-auto text-xs text-ink-muted tabular-nums">
          {words} {hero.words}
        </span>
      </div>
      <div className="px-4 py-5 md:p-7">
        <p className="mb-4 font-serif text-[28px] leading-9 font-semibold tracking-[-0.015em]">
          {heroDoc.title}
        </p>
        <p className="font-serif text-lg leading-[29px]">
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
