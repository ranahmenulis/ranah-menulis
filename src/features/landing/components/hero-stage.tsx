"use client";

import { useEffect, useRef, useState } from "react";
import { Monogram } from "@/components/ui/logo";
import { BookCover } from "@/components/ui/book-cover";
import { VisibilityTag } from "@/components/ui/visibility-tag";
import { useT } from "@/lib/i18n/provider";
import { heroDoc } from "../copy/doc";

/**
 * Satu momen di hero: paragraf diketik di Studio, tersimpan, menjadi halaman 12, lalu sampul.
 * Sekali saat dimuat, 3,6 detik. Hanya opasitas dan transform (docs/desain/landing/Gerak.dc.html).
 *
 * HTML dari server berisi keadaan akhir. Skrip kecil di halaman memasang `is-animating` pada <html>
 * sebelum tampilan pertama; hanya itu yang menyembunyikan teks dan tahap. Tanpa skrip atau dengan
 * reduced motion, pengunjung langsung melihat keadaan akhir.
 */

const FULL = heroDoc.typed;
const WORDS_END = 167;

const stage =
  "relative after:pointer-events-none after:absolute after:inset-0 after:border after:border-line " +
  "after:opacity-0 after:transition-opacity after:duration-300 after:ease-out data-[wait=true]:after:opacity-100 " +
  "[&>*]:transition-[opacity,transform] [&>*]:duration-400 [&>*]:ease-out " +
  "data-[wait=true]:[&>*]:translate-y-2 data-[wait=true]:[&>*]:opacity-0";

export function HeroStage() {
  const { hero } = useT().landing;
  const [typed, setTyped] = useState(FULL.length);
  const [phase, setPhase] = useState(3); // 0 mengetik, 1 tersimpan, 2 halaman, 3 sampul (akhir)
  const [started, setStarted] = useState(false);
  // Keputusan dibaca sekali. Strict Mode menjalankan efek dua kali; pembacaan kedua tidak boleh
  // bergantung pada kelas yang mungkin sudah berubah.
  const animate = useRef<boolean | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    animate.current ??= root.classList.contains("is-animating");
    if (!animate.current) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    let interval: ReturnType<typeof setInterval> | undefined;

    // Dari keadaan akhir (HTML server) ke awal. Sampai `started`, CSS menyembunyikan semuanya,
    // jadi lompatan ini tidak pernah terlihat.
    timers.push(
      setTimeout(() => {
        setTyped(0);
        setPhase(0);
        setStarted(true);

        let n = 0;
        interval = setInterval(() => {
          n += 2;
          if (n >= FULL.length) {
            clearInterval(interval);
            setTyped(FULL.length);
            setPhase(1);
            timers.push(setTimeout(() => setPhase(2), 450));
            timers.push(
              setTimeout(() => {
                setPhase(3);
                root.classList.remove("is-animating");
              }, 1050),
            );
          } else {
            setTyped(n);
          }
        }, 34);
      }, 0),
    );

    return () => {
      clearInterval(interval);
      timers.forEach(clearTimeout);
    };
  }, []);

  const words = Math.round(WORDS_END - 20 + (typed / FULL.length) * 20);

  return (
    <div
      data-hero
      data-started={started || undefined}
      role="img"
      aria-label={hero.ariaLabel}
      className="mt-14 grid grid-cols-2 items-end gap-x-4 gap-y-4 border-b border-line-strong md:col-span-12 md:mt-24 md:grid-cols-12 md:gap-x-6"
    >
      <div data-hero-stage className={`${stage} col-span-2 md:col-span-5`}>
        <div className="overflow-hidden border border-line bg-canvas" aria-hidden>
          <div className="flex h-12 items-center gap-3 border-b border-line px-4">
            <Monogram height={20} />
            <span className="hidden max-w-[160px] truncate text-sm font-medium md:inline">
              {heroDoc.shortTitle}
            </span>
            <VisibilityTag visibility="pribadi" />
            <span data-hero-hide className="text-xs text-ink-muted">
              {phase === 0 ? hero.saving : hero.saved}
            </span>
            <span data-hero-hide className="ml-auto text-xs text-ink-muted tabular-nums">
              {words.toLocaleString()} {hero.words}
            </span>
          </div>
          <div className="px-4 pt-5 pb-6 md:min-h-[196px] md:px-6 md:pt-6 md:pb-7">
            <p className="mb-3 font-serif text-[22px] leading-7 font-semibold tracking-[-0.01em]">
              {heroDoc.title}
            </p>
            <p data-hero-hide className="font-serif text-[17px] leading-7">
              {FULL.slice(0, typed)}
              {phase === 0 && (
                <span className="-mb-[0.15em] ml-px inline-block h-[1.1em] w-[1.5px] animate-[lp-blink_1s_steps(1)_infinite] bg-ink align-baseline" />
              )}
            </p>
          </div>
        </div>
      </div>

      <div
        data-hero-stage
        data-wait={phase < 2}
        className={`${stage} hidden md:col-span-3 md:col-start-6 md:block`}
      >
        <div
          aria-hidden
          className="flex aspect-[1/1.43] flex-col overflow-hidden border border-line bg-canvas px-[26px] pt-[30px] pb-5"
        >
          <p className="mb-[18px] text-center font-serif text-[11px] leading-4 text-ink-muted italic">
            {heroDoc.title}
          </p>
          {heroDoc.page.map((p) => (
            <p key={p} className="mb-2.5 font-serif text-[13px] leading-[21px]">
              {p}
            </p>
          ))}
          <p className="mt-auto text-center font-serif text-xs leading-4 text-ink-muted [font-variant-numeric:lining-nums]">
            12
          </p>
        </div>
      </div>

      <div
        data-hero-stage
        data-wait={phase < 3}
        className={`${stage} col-span-2 md:col-span-4 md:col-start-9`}
      >
        <div className="hidden md:block">
          <BookCover title={heroDoc.title} author={heroDoc.author} width={330} />
        </div>
        <div className="md:hidden">
          <BookCover title={heroDoc.title} author={heroDoc.author} width={240} />
        </div>
      </div>
    </div>
  );
}
