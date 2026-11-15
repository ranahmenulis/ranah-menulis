"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { ErrorBanner, RetryButton, Skeleton } from "@/components/ui/states";
import { StatusSubmission } from "@/components/ui/status-submission";
import { cn } from "@/lib/cn";
import type { StreakData } from "@/features/studio/hooks/use-streak-data";
import { formatChanged } from "@/features/studio/relative-time";
import { NOTIFICATIONS_HREF } from "@/features/app-shell/nav";
import { agoLabel, leadOf } from "@/features/notifications/notification-text";
import { useNotifications } from "@/features/notifications/use-notifications";
import { attention, projects } from "./fixtures";

const number = new Intl.NumberFormat("id-ID");

/** One labelled row of the "Hari ini" block: a line above, no box (DESIGN.md 6.2). */
function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-6 gap-y-2 border-b border-line py-4 md:grid-cols-[10rem_minmax(0,1fr)_auto] md:py-5">
      <p className="col-span-full pt-0.5 text-xs font-medium text-ink-muted md:col-span-1 md:text-sm">
        {label}
      </p>
      {children}
    </div>
  );
}

const sub = "mt-1 text-sm text-ink-muted";

function Continue({ data }: { data: StreakData }) {
  const doc = data.lastDocument;
  if (!doc) {
    return (
      <Row label="Mulai menulis">
        <div className="min-w-0">
          <p className="font-serif text-lg leading-6 font-semibold">Belum ada dokumen.</p>
          <p className={sub}>Satu kalimat sudah cukup untuk memulai.</p>
        </div>
        <ButtonLink href="/studio/baru" size="sm">
          Mulai menulis
        </ButtonLink>
      </Row>
    );
  }
  return (
    <Row label="Lanjutkan menulis">
      <div className="min-w-0">
        <p className="font-serif text-lg leading-6 font-semibold [overflow-wrap:anywhere] md:text-xl md:leading-7">
          {doc.title || "Tanpa judul"}
        </p>
        <p className={sub}>
          {number.format(doc.wordCount)} kata · diubah {formatChanged(doc.updatedAt, data.nowMs)} ·
          Pribadi
        </p>
      </div>
      <ButtonLink href={`/studio/${doc.id}`} className="max-md:hidden">
        Lanjutkan menulis
      </ButtonLink>
      <ButtonLink href={`/studio/${doc.id}`} variant="secondary" size="sm" className="md:hidden">
        Lanjutkan
      </ButtonLink>
    </Row>
  );
}

function Progress({ data }: { data: StreakData }) {
  const { target, todayWords, summary } = data;
  if (target === null) {
    return (
      <Row label="Progres hari ini">
        <p className="font-serif text-lg leading-6 font-semibold">Belum ada target harian.</p>
        <ButtonLink href="/studio/streak" variant="text" size="sm" className="px-0 text-ink">
          Tetapkan target
        </ButtonLink>
      </Row>
    );
  }
  const label = `Progres hari ini ${todayWords} dari ${target} kata, streak ${summary.current} hari. Buka Streak`;
  return (
    <Row label="Progres hari ini">
      <Link
        href="/studio/streak"
        aria-label={label}
        className="col-span-2 grid gap-2 text-sm no-underline md:col-span-2"
      >
        <span className="flex items-baseline gap-1.5 tabular-nums">
          <b className="font-medium">{number.format(todayWords)}</b>
          <span className="text-ink-muted">/ {number.format(target)} kata</span>
          <span className="ml-auto">Streak {summary.current} hari</span>
        </span>
        <span aria-hidden className="h-1 bg-line">
          <i
            className="block h-full bg-ink"
            style={{ width: `${Math.min(100, (todayWords / target) * 100)}%` }}
          />
        </span>
      </Link>
    </Row>
  );
}

function Attention() {
  return (
    <Row label="Perlu perhatian">
      <ul className="col-span-2 grid gap-4 md:col-span-2">
        {attention.map((a, i) => (
          <li
            key={a.title}
            className={cn("flex items-start justify-between gap-4", i > 0 && "max-md:hidden")}
          >
            <span className="min-w-0 text-sm">
              <b className="font-medium">{a.title}</b>
              <span className="mt-0.5 block text-xs text-ink-muted">{a.meta}</span>
            </span>
            <span className="flex shrink-0 gap-1">
              {a.actions.map((label) => (
                <Button
                  key={label}
                  variant="text"
                  size="sm"
                  className="text-ink"
                  disabled
                  title="Segera"
                >
                  {label}
                </Button>
              ))}
            </span>
          </li>
        ))}
        <li className="md:hidden">
          <Button variant="text" size="sm" className="px-0 text-ink" disabled>
            Lihat {attention.length - 1} lainnya
          </Button>
        </li>
      </ul>
    </Row>
  );
}

function Projects() {
  return (
    <Row label="Proyek saya">
      <ul className="grid gap-3 max-md:col-span-2">
        {projects.map((p, i) => (
          <li key={p.name} className={cn("flex items-start gap-3", i > 0 && "max-md:hidden")}>
            <StatusSubmission status={p.status} />
            <span className="min-w-0 text-sm">
              <b className="font-medium">{p.name}</b>
              <span className="block text-xs text-ink-muted">{p.meta}</span>
            </span>
          </li>
        ))}
      </ul>
      <Button
        variant="text"
        size="sm"
        className="px-0 text-ink max-md:col-span-2 max-md:justify-self-start"
        disabled
        title="Segera"
      >
        Lihat semua
      </Button>
    </Row>
  );
}

/** The newest unread notification and how many wait; nothing is drawn when all are read. */
function Notifications() {
  const { items, unread, now } = useNotifications();
  const latest = items.find((n) => !n.read);
  if (!latest) return null;
  const lead = leadOf(latest);
  return (
    <div className="max-md:hidden">
      <Row label="Notifikasi baru">
        <div className="min-w-0 text-sm">
          <p>
            {lead && <b className="font-medium">{lead}</b>} {latest.text}
          </p>
          <p className={sub}>
            {number.format(unread)} belum dibaca
            {now > 0 && ` · terbaru ${agoLabel(latest.agoMs, now)}`}
          </p>
        </div>
        <ButtonLink href={NOTIFICATIONS_HREF} variant="text" size="sm">
          Buka notifikasi
        </ButtonLink>
      </Row>
    </div>
  );
}

function Loading() {
  return (
    <div
      role="status"
      aria-label="Memuat Hari ini"
      className="animate-[rm-appear_0s_300ms_forwards] opacity-0"
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="grid gap-2 border-b border-line py-5 md:grid-cols-[10rem_1fr] md:gap-6"
        >
          <Skeleton className="h-3.5 w-28" />
          <div className="grid gap-2.5">
            <Skeleton className="h-5" style={{ width: `${62 - i * 8}%` }} />
            <Skeleton className="h-3 w-2/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * "Hari ini" (PLT-10, Brief 4A): the answer to "what should I do now", as lines, not widgets. Blocks
 * that have nothing are not drawn. Writing blocks use this device's data and notifications come
 * from src/features/notifications; attention and projects are dummy content until Projects exists.
 * One filled button only.
 */
export function TodayBlock({ data, showDummy }: { data: StreakData; showDummy: boolean }) {
  if (data.status === "loading") return <Loading />;
  if (data.status === "error") {
    return (
      <ErrorBanner action={<RetryButton onClick={data.reload} />}>
        Hari ini gagal dimuat. Isi dokumenmu tidak berubah; blok lain di Beranda tetap bisa dipakai.
      </ErrorBanner>
    );
  }
  return (
    <div className="border-t border-line-strong">
      <Continue data={data} />
      <Progress data={data} />
      {showDummy && (
        <>
          <Attention />
          <Projects />
          <Notifications />
        </>
      )}
    </div>
  );
}
