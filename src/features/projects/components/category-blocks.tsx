import type { ReactNode } from "react";
import { moneyLabel } from "../project-model";
import type { CategoryBlock } from "../types";

/** A titled block of the detail page, in the document layout (DESIGN.md 6.7). */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-3">
      <h2 className="heading-md">{title}</h2>
      {children}
    </section>
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
        <p className="text-base">
          Tema: <span className="font-medium wrap-anywhere">{block.theme}</span>
        </p>
        <ol className="grid list-decimal gap-1.5 pl-5 text-base marker:text-ink-muted">
          {block.stages.map((stage, i) => (
            <li key={i} className="wrap-anywhere">
              {stage}
            </li>
          ))}
        </ol>
      </Section>
    );
  }

  if (block.kind === "solo") {
    return (
      <Section title="Paket layanan">
        <ul className="grid">
          {block.packages.map((pack, i) => (
            <li key={i} className="grid gap-1 border-b border-line py-4 first:pt-0">
              <p className="flex flex-wrap items-baseline justify-between gap-x-4 text-base">
                <span className="font-semibold wrap-anywhere">{pack.name}</span>
                <span className="text-sm text-ink-muted">{moneyLabel(pack.fee)}</span>
              </p>
              <p className="text-sm text-ink-muted">{pack.includes.join(" · ")}</p>
            </li>
          ))}
        </ul>
      </Section>
    );
  }

  if (block.kind === "kelas") {
    return (
      <Section title="Pengajar dan kurikulum">
        <p className="text-base">
          <span className="font-semibold wrap-anywhere">{block.teacher.name}</span>
          <span className="text-ink-muted"> · {block.teacher.bio}</span>
        </p>
        <ol className="grid">
          {block.modules.map((module, i) => (
            <li
              key={i}
              className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-line py-3 text-base"
            >
              <span className="wrap-anywhere">
                <span className="text-ink-muted tabular-nums">Modul {i + 1}. </span>
                {module.title}
              </span>
              <span className="text-sm text-ink-muted">{module.meetings} pertemuan</span>
            </li>
          ))}
        </ol>
      </Section>
    );
  }

  return (
    <Section title="Kriteria dan hadiah">
      <ul className="grid">
        {block.criteria.map((c, i) => (
          <li
            key={i}
            className="flex items-baseline justify-between gap-4 border-b border-line py-3 text-base"
          >
            <span className="wrap-anywhere">{c.name}</span>
            <span className="text-sm text-ink-muted tabular-nums">{c.weight}%</span>
          </li>
        ))}
      </ul>
      <ul className="grid gap-1 text-base">
        {block.prizes.map((prize, i) => (
          <li key={i} className="wrap-anywhere">
            {prize}
          </li>
        ))}
      </ul>
      {block.anonymous && (
        <p className="text-sm text-ink-muted">
          Penilaian anonim: nama dan profil peserta disembunyikan dari juri sampai penilaian
          ditutup.
        </p>
      )}
    </Section>
  );
}
