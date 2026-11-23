"use client";

import { SkyByHour } from "@/components/illustrations/home-art";
import { ButtonLink } from "@/components/ui/button";
import { DISCOVER_HREF } from "@/features/app-shell/nav";
import { useT } from "@/lib/i18n/provider";
import { useDayPart } from "./use-day-part";

/**
 * The feed of a writer who follows no one yet: the sky of their hour in small (DESIGN.md 7.10, 8),
 * one sentence and one way out. The sky is drawn once the clock has been read.
 */
export function EmptyFeed({ nowMs }: { nowMs: number }) {
  const t = useT().home.feed;
  const part = useDayPart(nowMs);
  return (
    <div className="grid justify-items-start gap-3 px-5 py-8">
      <div className="h-32 w-full max-w-72 overflow-hidden rounded-xl bg-subtle" aria-hidden>
        {part && <SkyByHour part={part} className="size-full" />}
      </div>
      <p className="font-serif text-xl leading-7 font-semibold">{t.emptyTitle}</p>
      <p className="max-w-110 text-sm text-ink-muted">{t.emptyBody}</p>
      <ButtonLink href={DISCOVER_HREF} variant="secondary">
        {t.openCommunity}
      </ButtonLink>
    </div>
  );
}
