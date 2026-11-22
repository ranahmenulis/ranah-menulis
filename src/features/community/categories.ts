import { SEED_PICK_IDS } from "./curation/seed-picks";
import { authorOf } from "./post-model";
import type { CategoryId, Post } from "./types";

export type Category = { id: CategoryId; label: string; description: string };

/**
 * Community shows one list of all public posts for now. The category chips are hidden because the
 * client will replace them with the Fase 2 features (roasting, writer battle, and the like), 22
 * November 2026. The categories and their rules stay in code; turn this on to bring the chips back.
 * While off, Editor's Picks has no public place to appear.
 */
export const CATEGORY_CHIPS_VISIBLE = false;

/**
 * Jelajahi categories (COM-09). Names stay in English like the PRD [konfirmasi]. "Semua" is the
 * first chip (DESIGN.md 6.8) and is not one of the eight PRD categories.
 */
export const CATEGORIES: Category[] = [
  { id: "semua", label: "Semua", description: "Semua tulisan publik, yang terbaru di atas." },
  {
    id: "trending",
    label: "Trending Today",
    description: "Tulisan yang paling banyak dibaca dan dibalas hari ini.",
  },
  {
    id: "new",
    label: "New Writers",
    description: "Postingan pertama dari penulis yang baru bergabung.",
  },
  { id: "editor", label: "Editor's Picks", description: "Dipilih langsung oleh tim RanahMenulis." },
  {
    id: "appreciated",
    label: "Most Appreciated",
    description: "Diurutkan menurut jumlah Apresiasi.",
  },
  {
    id: "saved",
    label: "Most Saved",
    description: "Tulisan yang paling sering disimpan pembaca.",
  },
  {
    id: "hidden",
    label: "Hidden Gems",
    description: "Jarang diapresiasi, tetapi dibaca sampai habis dan disimpan.",
  },
  {
    id: "id",
    label: "Indonesia Writers",
    description: "Penulis yang negara di profilnya Indonesia.",
  },
  {
    id: "my",
    label: "Malaysia Writers",
    description: "Penulis yang negara di profilnya Malaysia.",
  },
];

/**
 * Curated picks. How the real categories are computed is BR-COM-05 and its formula is
 * [konfirmasi] (Q-17); until then these lists stand in for it.
 */
const PICKS: Partial<Record<CategoryId, string[]>> = {
  trending: [
    "bahasa-untuk-memarahi-adik",
    "hujan-pertama-bulan-november",
    "toples-kerupuk",
    "rumah-di-ujung-rel",
    "pasar-malam-selepas-hujan",
    "dua-puluh-menit-sebelum-subuh",
    "jam-dinding-kedai-kopi-ah-seng",
    "resep-yang-tidak-pernah-ditulis",
    "probolinggo-pukul-lima",
    "kata-yang-tidak-jujur",
    "penjaga-mercusuar",
  ],
  new: [
    "anak-tangga-rumah-tok-wan",
    "surat-dari-lantai-dua-puluh",
    "nasi-lemak-pukul-enam",
    "kereta-malam-ke-bandung",
  ],
  hidden: [
    "anak-tangga-rumah-tok-wan",
    "resep-yang-tidak-pernah-ditulis",
    "probolinggo-pukul-lima",
    "daftar-belanja-terakhir-ibu",
  ],
};

const SAVED_LIMIT = 6;

const newestFirst = (a: Post, b: Post) => b.publishedAt - a.publishedAt || a.id.localeCompare(b.id);

/**
 * Posts in one category. Only public posts qualify (group posts never reach Jelajahi). Only Most
 * Appreciated is ordered by appreciations (DESIGN.md 6.8 #6). A post written on this device leads
 * the lists a new public post belongs to: Semua, Trending Today, and its country.
 */
export function postsForCategory(
  id: CategoryId,
  all: Post[],
  editorIds: readonly string[] = SEED_PICK_IDS,
): Post[] {
  const pool = all.filter((p) => p.visibility === "publik");
  const mine = pool.filter((p) => p.local).sort(newestFirst);
  const theirs = pool.filter((p) => !p.local);

  switch (id) {
    case "semua":
      return [...pool].sort(newestFirst);
    case "trending":
      return [...mine, ...pick(PICKS.trending, theirs)];
    case "appreciated":
      return [...pool].sort((a, b) => b.appreciations - a.appreciations || newestFirst(a, b));
    case "saved":
      return [...pool].sort((a, b) => b.saves - a.saves || newestFirst(a, b)).slice(0, SAVED_LIMIT);
    case "editor":
      return pick(editorIds, pool);
    case "id":
    case "my": {
      const country = id === "id" ? "ID" : "MY";
      return pool.filter((p) => authorOf(p.authorId).country === country).sort(newestFirst);
    }
    default:
      return pick(PICKS[id], theirs);
  }
}

function pick(ids: readonly string[] | undefined, pool: Post[]): Post[] {
  const byId = new Map(pool.map((p) => [p.id, p]));
  return (ids ?? []).flatMap((id) => byId.get(id) ?? []);
}

/** Categories without any post are not listed at all (COM-09). */
export function visibleCategories(
  all: Post[],
  editorIds: readonly string[] = SEED_PICK_IDS,
): Category[] {
  return CATEGORIES.filter((c) => postsForCategory(c.id, all, editorIds).length > 0);
}

export const categoryById = (id: string): Category | undefined =>
  CATEGORIES.find((c) => c.id === id);

/** Divisible by two, three and four lanes, so a page ends on a full row. */
export const PAGE_SIZE = 12;
