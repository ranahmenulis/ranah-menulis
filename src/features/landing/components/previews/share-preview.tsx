"use client";

import { Lock } from "@phosphor-icons/react/dist/ssr";
import { CheckMark } from "@/components/ui/choice";
import { VisibilityTag } from "@/components/ui/visibility-tag";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/provider";
import { heroDoc } from "../../copy/doc";
import { reached, useLoopTime } from "../../motion/use-loop";

// One subject per cycle: the first paragraph is ticked, then the public-copy notice appears.
// Mirrors the block picker in Tulis postingan (community/components/compose/source-picker.tsx).
const RESET_MS = 150;
const TICKED_AT = 700;
const NOTICE_AT = 1500;

export function SharePreview() {
  const { previews } = useT().landing;
  const time = useLoopTime();
  const instant = time !== null && time < RESET_MS;
  const ticked = reached(time, TICKED_AT);
  const notice = reached(time, NOTICE_AT);

  return (
    <>
      <div className="px-4 pt-5 md:px-6">
        <div className="flex items-center gap-2 text-sm">
          <Lock size={16} aria-hidden className="shrink-0 text-ink-muted" />
          <b className="min-w-0 truncate font-medium">{heroDoc.title}</b>
        </div>
        <p className="my-3 text-sm text-ink-muted">{previews.shareHint}</p>
      </div>
      <div className="border-t border-line">
        {heroDoc.page.map((text, i) => {
          const on = i === 0 && ticked;
          return (
            <div
              key={text}
              className={cn(
                "flex items-start gap-3 border-b border-line py-3.5 pr-4 pl-4 md:pl-6",
                !instant && "transition-colors duration-200 ease-out",
                on && "bg-subtle",
              )}
            >
              <CheckMark checked={on} />
              <p className="line-clamp-2 min-w-0 font-serif text-base leading-[26px] text-ink-read">
                {text}
              </p>
            </div>
          );
        })}
      </div>
      <div
        className={cn(
          "flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-4 text-xs md:px-6",
          !instant && "transition-[opacity,transform] duration-300 ease-out",
          notice ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
        )}
      >
        <VisibilityTag visibility="publik" />
        <span className="text-ink">{previews.shareNotice}</span>
      </div>
    </>
  );
}
