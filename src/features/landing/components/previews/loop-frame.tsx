"use client";

import type { ReactNode } from "react";
import { Pause, Play } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/provider";
import { LoopTimeContext, useLoop } from "../../motion/use-loop";

/**
 * Frame of one Ekosistem preview. The picture is one image for assistive tech (its label
 * describes the finished state); the loop inside only demonstrates it. The pause button sits in
 * the gap under the frame, so it never covers the picture and never shifts the layout.
 */
export function LoopFrame({
  id,
  label,
  className,
  children,
}: {
  id: string;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const { previews } = useT().landing;
  const { attach, motion, active, paused, time, enter, leave, togglePause } = useLoop(id);

  return (
    <div
      ref={attach}
      data-loop={id}
      className="relative"
      onPointerEnter={enter}
      onPointerLeave={leave}
    >
      <figure
        role="img"
        aria-label={label}
        className={cn("m-0 min-w-0 overflow-hidden border border-line bg-canvas", className)}
      >
        <LoopTimeContext value={time}>{children}</LoopTimeContext>
      </figure>
      {motion && (
        <button
          type="button"
          onClick={togglePause}
          aria-label={paused ? previews.play : previews.pause}
          data-show={active || paused || undefined}
          className={cn(
            "absolute top-full right-0 mt-1 grid size-11 cursor-pointer place-items-center text-ink-muted",
            "opacity-0 transition-opacity duration-150 ease-out hover:text-ink",
            "focus-visible:opacity-100 data-show:opacity-100",
          )}
        >
          <span className="grid size-8 place-items-center rounded-full border border-line bg-canvas">
            {paused ? <Play size={14} aria-hidden /> : <Pause size={14} aria-hidden />}
          </span>
        </button>
      )}
    </div>
  );
}
