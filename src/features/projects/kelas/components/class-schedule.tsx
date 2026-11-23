"use client";

import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/provider";
import { useFormat } from "@/lib/i18n/use-format";
import { ExternalLink } from "./external-link";
import { Section } from "@/components/ui/section-card";
import { nextSession, sessionOver } from "../class-model";
import { sessionTime } from "../class-text";
import type { ClassContent } from "../types";
import type { TimeZoneName } from "../../types";

/** The next meeting first, then the whole schedule with the finished ones muted. */
export function ClassSchedule({
  content,
  now,
  zone,
}: {
  content: ClassContent;
  now: number;
  zone: TimeZoneName;
}) {
  const t = useT().projectsClass.schedule;
  const { locale } = useFormat();
  const next = nextSession(content, now);
  if (content.sessions.length === 0) {
    return (
      <Section title={t.title}>
        <p className="text-sm text-ink-muted">{t.none}</p>
      </Section>
    );
  }
  return (
    <Section title={t.title}>
      {next ? (
        <div className="grid gap-1 rounded-xl border border-accent/30 bg-accent-subtle/60 p-4">
          <p className="text-xs text-ink-muted">{t.next}</p>
          <p className="text-base font-medium wrap-anywhere">{next.title}</p>
          <p className="text-sm">{sessionTime(next.at, zone, locale)}</p>
          <ExternalLink href={next.link}>{t.openLink}</ExternalLink>
        </div>
      ) : (
        <p className="text-sm text-ink-muted">{t.allOver}</p>
      )}
      <ol className="grid gap-2 text-sm">
        {content.sessions.map((s) => {
          const over = sessionOver(s, now);
          return (
            <li key={s.id} className={cn("grid gap-0.5", over && "text-ink-muted")}>
              <span className="wrap-anywhere">{s.title}</span>
              <span className="text-xs text-ink-muted">
                {sessionTime(s.at, zone, locale)}
                {over ? t.over : ""}
              </span>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
