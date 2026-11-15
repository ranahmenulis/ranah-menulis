"use client";

import { Fragment, useState } from "react";
import { cn } from "@/lib/cn";

const MENTION = /(@[a-z0-9_]+)/gu;
/** Long replies are cut at 6 lines (DESIGN.md 6.9 #4). Measured by length, not by layout. */
const LONG_CHARS = 320;

/** Comment text in the UI sans (not serif, so it reads apart from the work). @name is underlined. */
export function CommentText({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > LONG_CHARS || text.split("\n").length > 6;

  return (
    <>
      <p
        className={cn(
          "mt-1 text-[15px] leading-6 wrap-anywhere whitespace-pre-line text-ink",
          long && !open && "line-clamp-6",
        )}
      >
        {text.split(MENTION).map((part, i) =>
          part.startsWith("@") ? (
            <span key={i} className="underline underline-offset-3">
              {part}
            </span>
          ) : (
            <Fragment key={i}>{part}</Fragment>
          ),
        )}
      </p>
      {long && !open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-1 cursor-pointer text-[13px] leading-[18px] text-ink-muted underline underline-offset-3 hover:text-ink"
        >
          Lihat selengkapnya
        </button>
      )}
    </>
  );
}
