import { cn } from "@/lib/cn";
import { ExternalLink } from "./external-link";
import { Section } from "../../components/category-blocks";
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
  const next = nextSession(content, now);
  if (content.sessions.length === 0) {
    return (
      <Section title="Jadwal">
        <p className="text-sm text-ink-muted">Jadwal pertemuan belum diumumkan.</p>
      </Section>
    );
  }
  return (
    <Section title="Jadwal">
      {next ? (
        <div className="grid gap-1 border border-line p-4">
          <p className="text-xs text-ink-muted">Pertemuan berikutnya</p>
          <p className="text-base font-medium wrap-anywhere">{next.title}</p>
          <p className="text-sm">{sessionTime(next.at, zone)}</p>
          <ExternalLink href={next.link}>Buka tautan pertemuan</ExternalLink>
        </div>
      ) : (
        <p className="text-sm text-ink-muted">Semua pertemuan sudah berlangsung.</p>
      )}
      <ol className="grid gap-2 text-sm">
        {content.sessions.map((s) => {
          const over = sessionOver(s, now);
          return (
            <li key={s.id} className={cn("grid gap-0.5", over && "text-ink-muted")}>
              <span className="wrap-anywhere">{s.title}</span>
              <span className="text-xs text-ink-muted">
                {sessionTime(s.at, zone)}
                {over ? " · sudah berlangsung" : ""}
              </span>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
