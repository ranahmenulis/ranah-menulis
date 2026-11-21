"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useRevealOnce } from "@/lib/use-reveal-once";
import { moneyLabel } from "../project-model";
import type { CategoryBlock } from "../types";

/** A titled block of the detail page, in the document layout (DESIGN.md 6.7). */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-4">
      <h2 className="heading-md">{title}</h2>
      {children}
    </section>
  );
}

const two = (n: number) => String(n).padStart(2, "0");

/** Numbered steps with a large serif numeral each: the order is the point of the block. */
function Steps({ items }: { items: { title: ReactNode; meta?: ReactNode }[] }) {
  return (
    <ol className="grid">
      {items.map((item, i) => (
        <li
          key={i}
          className="grid grid-cols-[3rem_minmax(0,1fr)] items-baseline gap-x-3 border-t border-line py-4 last:border-b"
        >
          <span aria-hidden className="font-serif text-[28px] leading-none text-ink-faint">
            {two(i + 1)}
          </span>
          <div className="grid gap-0.5">
            <span className="text-base wrap-anywhere">{item.title}</span>
            {item.meta && <span className="text-sm text-ink-muted">{item.meta}</span>}
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Criteria with their weight drawn as a bar that fills once the block is seen. */
function Weights({ criteria }: { criteria: { name: string; weight: number }[] }) {
  const ref = useRef<HTMLUListElement>(null);
  const seen = useRevealOnce(ref);
  return (
    <ul ref={ref} className="grid gap-4">
      {criteria.map((c, i) => (
        <li key={i} className="grid gap-1.5">
          <p className="flex items-baseline justify-between gap-4 text-base">
            <span className="wrap-anywhere">{c.name}</span>
            <span className="text-sm font-medium tabular-nums">{c.weight}%</span>
          </p>
          <span aria-hidden className="block h-1 bg-line">
            <span
              className="block h-full origin-left bg-ink transition-[scale] duration-1000 ease-(--ease-out)"
              style={
                {
                  width: `${Math.min(100, c.weight)}%`,
                  scale: seen ? "1 1" : "0 1",
                  transitionDelay: `${i * 90}ms`,
                } as CSSProperties
              }
            />
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Prizes as a podium: the first is set large, the rest follow smaller. */
function Prizes({ prizes }: { prizes: string[] }) {
  return (
    <ol className="grid gap-2">
      {prizes.map((prize, i) => (
        <li
          key={i}
          className={cn(
            "font-serif wrap-anywhere",
            i === 0 ? "text-[22px] leading-8 font-semibold" : "text-lg leading-7 text-ink-soft",
          )}
        >
          {prize}
        </li>
      ))}
    </ol>
  );
}

/**
 * The one read-only block that differs per category: stages (Antologi), packages (Solo),
 * teacher and curriculum (Kelas), criteria and prizes (Lomba). Choosing a package, the class
 * dashboard, and judging are separate steps and screens.
 */
export function CategoryBlockView({ block }: { block: CategoryBlock }) {
  if (block.kind === "antologi") {
    return (
      <Section title="Alur seleksi dan produksi">
        <p className="font-serif text-xl leading-8 wrap-anywhere">
          <span className="font-sans text-sm text-ink-muted">Tema </span>
          <span className="font-semibold">{block.theme}</span>
        </p>
        <Steps items={block.stages.map((stage) => ({ title: stage }))} />
      </Section>
    );
  }

  if (block.kind === "solo") {
    return (
      <Section title="Paket layanan">
        <ul className="grid gap-3 sm:grid-cols-2">
          {block.packages.map((pack, i) => (
            <li
              key={i}
              className={cn(
                "grid content-start gap-3 p-5",
                i === block.packages.length - 1 ? "theme-dark app-band text-ink" : "bg-subtle",
              )}
            >
              <p className="font-serif text-lg leading-7 font-semibold wrap-anywhere">
                {pack.name}
              </p>
              <p className="text-2xl leading-8 font-semibold tabular-nums">
                {moneyLabel(pack.fee)}
              </p>
              <ul className="grid gap-1 text-sm text-ink-soft">
                {pack.includes.map((item, j) => (
                  <li key={j} className="flex gap-2">
                    <span aria-hidden>—</span>
                    <span className="wrap-anywhere">{item}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Section>
    );
  }

  if (block.kind === "kelas") {
    return (
      <Section title="Pengajar dan kurikulum">
        <div className="flex items-center gap-4 bg-subtle p-4">
          <span
            aria-hidden
            className="grid size-12 shrink-0 place-items-center rounded-full bg-ink font-serif text-xl text-on-ink"
          >
            {block.teacher.name.charAt(0)}
          </span>
          <p className="grid gap-0.5">
            <span className="font-semibold wrap-anywhere">{block.teacher.name}</span>
            <span className="text-sm text-ink-soft">{block.teacher.bio}</span>
          </p>
        </div>
        <Steps
          items={block.modules.map((module, i) => ({
            title: (
              <>
                <span className="sr-only">Modul {i + 1}. </span>
                {module.title}
              </>
            ),
            meta: `${module.meetings} pertemuan`,
          }))}
        />
      </Section>
    );
  }

  return (
    <Section title="Kriteria dan hadiah">
      <Weights criteria={block.criteria} />
      <div className="mt-2 grid gap-3 border-t border-line pt-5">
        <h3 className="text-sm font-medium text-ink-muted">Hadiah</h3>
        <Prizes prizes={block.prizes} />
      </div>
      {block.anonymous && (
        <p className="text-sm text-ink-muted">
          Penilaian anonim: nama dan profil peserta disembunyikan dari juri sampai penilaian
          ditutup.
        </p>
      )}
    </Section>
  );
}
