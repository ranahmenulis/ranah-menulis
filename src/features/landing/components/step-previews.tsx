import type { ReactNode } from "react";
import {
  BookmarkSimple,
  Check,
  ChatCircle,
  HandsClapping,
  ShareNetwork,
} from "@phosphor-icons/react/dist/ssr";
import { Avatar } from "@/components/ui/avatar";
import { BookCover } from "@/components/ui/book-cover";
import { Monogram } from "@/components/ui/logo";
import { cn } from "@/lib/cn";
import { heroDoc } from "../copy";

function Frame({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <figure
      aria-label={label}
      className={cn("m-0 min-w-0 overflow-hidden border border-line bg-canvas", className)}
    >
      {children}
    </figure>
  );
}

export function EditorPreview() {
  return (
    <Frame label="Cuplikan editor Studio">
      <div className="flex h-14 items-center gap-4 border-b border-line px-4">
        <Monogram height={20} />
        <span className="hidden max-w-[220px] truncate text-sm font-medium md:inline">
          {heroDoc.title}
        </span>
        <span className="text-xs text-ink-muted tabular-nums">
          Pribadi · Tersimpan 14.02 · 167 kata
        </span>
        <span className="ml-auto hidden h-8 items-center rounded-full border border-ink px-4 text-sm font-medium md:inline-flex">
          Bagikan
        </span>
      </div>
      <div className="px-4 py-5 md:p-7">
        <p className="mb-4 font-serif text-[28px] leading-9 font-semibold tracking-[-0.015em]">
          {heroDoc.title}
        </p>
        <p className="font-serif text-lg leading-[29px]">
          Ada orang yang menunggu dengan duduk di beranda, memandangi ujung jalan sampai matanya
          perih. Nenek menunggu dengan basah.
        </p>
      </div>
    </Frame>
  );
}

const weekdays = ["S", "S", "R", "K", "J", "S", "M"];
// November 2026 mulai hari Minggu; kalender mulai Senin, jadi 6 sel kosong sebelum tanggal 1.
const calendar: ("blank" | "ring" | "empty" | "full")[] = [
  ...Array<"blank">(6).fill("blank"),
  "ring",
  "empty",
  ...Array<"full">(12).fill("full"),
  "blank",
];

function CalendarPreview() {
  return (
    <div
      className="grid grid-cols-[repeat(7,36px)]"
      role="img"
      aria-label="Kalender November 2026: dua belas hari berturut-turut tercapai"
    >
      {weekdays.map((d, i) => (
        <span key={i} className="grid h-6 place-items-center text-xs text-ink-muted">
          {d}
        </span>
      ))}
      {calendar.map((kind, i) => {
        const today = i === 19;
        return (
          <span
            key={i}
            className={cn(
              "grid size-9 place-items-center",
              today && "shadow-[inset_0_0_0_1px_var(--ink)]",
            )}
          >
            {kind === "full" && <i className="size-3.5 rounded-full bg-ink" />}
            {kind === "ring" && (
              <i className="size-3.5 rounded-full shadow-[inset_0_0_0_1.5px_var(--ink)]" />
            )}
            {kind === "empty" && (
              <i className="size-1 rounded-full bg-line-strong opacity-(--opacity-dot-empty)" />
            )}
          </span>
        );
      })}
    </div>
  );
}

export function StreakPreview() {
  return (
    <Frame label="Cuplikan kalender Streak di Studio">
      <div className="flex flex-wrap items-start gap-x-12 gap-y-6 px-4 py-5 md:p-7">
        <div className="grid min-w-[200px] gap-5">
          <div className="flex items-baseline gap-2.5">
            <span className="figure">12</span>
            <span className="text-sm text-ink-muted">hari berturut-turut</span>
          </div>
          <div className="grid gap-2">
            <div className="flex justify-between text-xs tabular-nums">
              <span>Hari ini 500 / 500 kata</span>
              <span className="text-ink-muted">Tercapai</span>
            </div>
            <div className="h-1 bg-line">
              <i className="block h-full w-full bg-ink" />
            </div>
          </div>
        </div>
        <CalendarPreview />
      </div>
    </Frame>
  );
}

export function FeedPreview() {
  return (
    <Frame label="Cuplikan butir feed Community" className="px-6">
      <article className="grid gap-2 py-6">
        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <Avatar name="Hafiz Rahman" size={32} />
          <span>
            <b className="font-medium text-ink">Hafiz Rahman</b> · di{" "}
            <b className="font-medium text-ink">Grup Penulis Pesisir</b> · 2 jam
          </span>
        </div>
        <p className="font-serif text-base leading-[26px] whitespace-pre-wrap">
          {
            "Ibu menyimpan laut\ndi dalam toples kerupuk:\nsetiap kali dibuka,\nrumah kami berbau pulang."
          }
        </p>
        <div className="mt-2 flex items-center gap-5 text-xs text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <HandsClapping size={20} aria-hidden />
            Apresiasi 48
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ChatCircle size={20} aria-hidden />
            Komentar 6
          </span>
          <span className="hidden items-center gap-1.5 md:inline-flex">
            <ShareNetwork size={20} aria-hidden />
            Bagikan
          </span>
          <span className="hidden items-center gap-1.5 md:inline-flex">
            <BookmarkSimple size={20} aria-hidden />
            Simpan
          </span>
        </div>
      </article>
    </Frame>
  );
}

export function SubmissionPreview() {
  return (
    <Frame label="Cuplikan status kiriman antologi">
      <div className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-4 p-4 md:grid-cols-[64px_minmax(0,1fr)_auto] md:px-6 md:py-5">
        <BookCover title="Surat yang Tidak Pernah Terkirim" width={64} />
        <div className="min-w-0">
          <h4 className="text-base leading-6 font-semibold">
            Antologi: Surat yang Tidak Pernah Terkirim
          </h4>
          <span className="text-xs text-ink-muted">“Toples Kerupuk” · versi 2 · dikirim 3 Nov</span>
        </div>
        <span className="col-start-2 inline-flex h-6 items-center gap-1.5 justify-self-start rounded-full border border-line-strong px-2.5 text-xs font-medium md:col-start-auto">
          <Check size={14} aria-hidden />
          Diterima
        </span>
      </div>
      <div className="grid grid-cols-[64px_minmax(0,1fr)] gap-4 border-t border-line p-4 md:px-6 md:py-5">
        <span />
        <span className="text-xs text-ink-muted">
          Draf di Studio diubah 2 jam lalu. Versi yang dikirim tetap versi 2.
        </span>
      </div>
    </Frame>
  );
}
