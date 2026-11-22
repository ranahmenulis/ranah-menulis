import type { Locale } from "@/lib/i18n/config";
import { catalogCopy } from "./copy/catalog";
import type { ProjectCategory } from "./types";

/**
 * Project covers (DESIGN.md 7.6): a typographic cover drawn from the project itself, so every
 * project has a face without anyone uploading art. The pattern follows the category, and the tone
 * and variant come from the slug, so one project always looks the same on every screen.
 */
export type CoverTone = "ink" | "paper";

export type Cover = {
  pattern: ProjectCategory;
  tone: CoverTone;
  /** 0, 1 or 2: shifts the pattern so two projects of one category still look different. */
  variant: number;
  /** The short name printed on the cover. */
  mark: string;
  /** The first letter of the title, drawn large on Solo covers. */
  initial: string;
  /** Pseudo-random lengths in [0.35, 1] for the lines of a pattern, stable per slug. */
  lines: number[];
};

export const COVER_VARIANTS = 3;
export const COVER_LINES = 9;

/** FNV-1a, 32 bit: small, fast, and the same in every browser. */
export function slugHash(slug: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < slug.length; i++) {
    hash ^= slug.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** The first letter or digit of a title, skipping quotes and punctuation; "R" when there is none. */
export function titleInitial(title: string): string {
  const match = title.match(/[\p{L}\p{N}]/u);
  return match ? match[0].toLocaleUpperCase("id") : "R";
}

/** A small seeded generator (mulberry32), so line lengths never change between renders. */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function coverOf(
  project: { slug: string; category: ProjectCategory; title: string },
  locale: Locale = "id",
): Cover {
  const hash = slugHash(project.slug);
  const random = seeded(hash);
  return {
    pattern: project.category,
    tone: hash % 2 === 0 ? "ink" : "paper",
    variant: Math.floor(hash / 2) % COVER_VARIANTS,
    mark: catalogCopy(locale).categories[project.category].label,
    initial: titleInitial(project.title),
    lines: Array.from(
      { length: COVER_LINES },
      () => Math.round((0.35 + random() * 0.65) * 100) / 100,
    ),
  };
}
