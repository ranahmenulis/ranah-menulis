import { CLASS_START_LABEL } from "@/features/projects/kelas/class-model";
import type { CategoryBlock, ProjectFixture, SubmissionRules } from "@/features/projects/types";
import {
  isOpenService,
  takesSubmissions,
  type InputErrors,
  type ProjectInput,
} from "./project-input";
import {
  dateInputOf,
  dayEnd,
  feeOf,
  linesOf,
  paragraphsOf,
  parseCriteria,
  parseModules,
  parseMilestones,
  parsePackages,
} from "./project-lines";

export const TITLE_LIMIT = 120;
export const SUMMARY_LIMIT = 200;
export const ABOUT_LIMIT = 4000;
export const POSTER_ALT_LIMIT = 200;

export type BuildContext = {
  now: number;
  /** Seats already taken; the quota may not go below it. */
  taken: number;
  existing?: ProjectFixture;
  /** Every slug in the catalog, to keep a new one unique. */
  slugs: readonly string[];
  ownerId: string;
};

export type BuildResult =
  { ok: true; project: ProjectFixture } | { ok: false; errors: InputErrors };

const whole = (text: string, min: number, max: number): number | null => {
  const t = text.trim().replace(/\./g, "");
  if (!/^\d{1,9}$/.test(t)) return null;
  const n = Number(t);
  return n >= min && n <= max ? n : null;
};

function basics(input: ProjectInput): InputErrors {
  const errors: InputErrors = {};
  const title = input.title.trim();
  if (!title) errors.title = "Tulis judul proyek.";
  else if (title.length > TITLE_LIMIT)
    errors.title = `Judul paling banyak ${TITLE_LIMIT} karakter.`;
  const summary = input.summary.trim();
  if (!summary) errors.summary = "Tulis satu kalimat ringkasan untuk katalog.";
  else if (summary.length > SUMMARY_LIMIT) {
    errors.summary = `Ringkasan paling banyak ${SUMMARY_LIMIT} karakter.`;
  }
  const about = input.about.trim();
  if (!about) errors.about = "Tulis deskripsi proyek.";
  else if (about.length > ABOUT_LIMIT)
    errors.about = `Deskripsi paling banyak ${ABOUT_LIMIT} karakter.`;
  if (linesOf(input.requirements).length === 0) errors.requirements = "Tulis minimal satu syarat.";
  const alt = input.posterAlt.trim();
  if (input.posterId && !alt) {
    errors.posterAlt = "Isi teks alternatif poster untuk menyimpan.";
  } else if (alt.length > POSTER_ALT_LIMIT) {
    errors.posterAlt = `Teks alternatif paling banyak ${POSTER_ALT_LIMIT} karakter.`;
  }
  return errors;
}

type Schedule = { closesAt: number | null; milestones: { label: string; at: number }[] };

function schedule(
  input: ProjectInput,
  errors: InputErrors,
  existing: ProjectFixture | undefined,
): Schedule {
  // A deadline the Organizer did not touch stays the exact moment it was: "Tutup pendaftaran"
  // stores "just now", and saving the form must not turn that back into the end of today.
  let closesAt: number | null = existing?.absolute?.closesAt ?? null;
  const untouched = closesAt !== null && input.closesDate === dateInputOf(closesAt, input.zone);
  if (!isOpenService(input.category) && !untouched) {
    closesAt = dayEnd(input.closesDate, input.zone);
    if (closesAt === null) errors.closesDate = "Pilih tanggal tenggat pendaftaran.";
  }
  const parsed = parseMilestones(input.milestones, input.zone);
  if (parsed.bad) {
    errors.milestones = `Baris “${parsed.bad}” belum benar. Tulis: nama tahap | yyyy-mm-dd.`;
  } else if (
    input.category === "kelas" &&
    !parsed.items.some((m) => m.label === CLASS_START_LABEL)
  ) {
    errors.milestones = `Kelas butuh satu baris “${CLASS_START_LABEL} | yyyy-mm-dd”.`;
  }
  return { closesAt, milestones: parsed.items };
}

function money(input: ProjectInput, errors: InputErrors, ctx: BuildContext) {
  if (isOpenService(input.category)) return { fee: {}, quota: null };
  const { fee, bad } = feeOf(input.feeIdr, input.feeMyr);
  if (bad === "idr") errors.feeIdr = "Tulis rupiah dalam angka bulat, mis. 75000, atau kosongkan.";
  if (bad === "myr") errors.feeMyr = "Tulis ringgit seperti 25 atau 25,50, atau kosongkan.";
  let quota: { total: number; taken: number } | null = null;
  if (input.quota.trim()) {
    const total = whole(input.quota, 1, 100_000);
    if (total === null) errors.quota = "Kuota harus angka bulat 1 sampai 100.000, atau kosongkan.";
    else if (total < ctx.taken) {
      errors.quota = `Kuota tidak boleh di bawah ${ctx.taken} peserta yang sudah terdaftar.`;
    } else quota = { total, taken: ctx.existing?.quota?.taken ?? 0 };
  }
  return { fee, quota };
}

function submission(input: ProjectInput, errors: InputErrors): SubmissionRules | null {
  if (!takesSubmissions(input.category)) return null;
  const minWords = whole(input.minWords, 1, 1_000_000);
  const maxWords = whole(input.maxWords, 1, 1_000_000);
  const maxWorks = whole(input.maxWorks, 1, 20);
  if (minWords === null || maxWords === null) {
    errors.minWords = "Tulis batas kata minimum dan maksimum sebagai angka bulat.";
  } else if (minWords > maxWords) errors.minWords = "Batas minimum tidak boleh di atas maksimum.";
  if (maxWorks === null) errors.maxWorks = "Karya per peserta: angka bulat 1 sampai 20.";
  if (minWords === null || maxWords === null || maxWorks === null || minWords > maxWords)
    return null;
  return { minWords, maxWords, maxWorks };
}

type BlockResult = CategoryBlock | string;

function antologiBlock(input: ProjectInput): BlockResult {
  const stages = linesOf(input.stages);
  if (!input.theme.trim() || stages.length === 0) {
    return "Antologi butuh tema dan minimal satu tahap (satu per baris).";
  }
  return { kind: "antologi", theme: input.theme.trim(), stages };
}

function soloBlock(input: ProjectInput): BlockResult {
  const parsed = parsePackages(input.packages);
  if (parsed.bad) {
    return `Baris “${parsed.bad}” belum benar. Tulis: nama paket | harga rupiah | butir; butir.`;
  }
  if (parsed.items.length === 0) return "Solo butuh minimal satu paket.";
  return { kind: "solo", packages: parsed.items };
}

function kelasBlock(input: ProjectInput): BlockResult {
  const modules = parseModules(input.modules);
  if (modules.bad)
    return `Baris “${modules.bad}” belum benar. Tulis: judul modul | jumlah pertemuan.`;
  if (!input.teacherName.trim() || !input.teacherBio.trim() || modules.items.length === 0) {
    return "Kelas butuh nama dan profil pengajar serta minimal satu modul.";
  }
  return {
    kind: "kelas",
    teacher: { name: input.teacherName.trim(), bio: input.teacherBio.trim() },
    modules: modules.items,
  };
}

function lombaBlock(input: ProjectInput): BlockResult {
  const criteria = parseCriteria(input.criteria);
  const prizes = linesOf(input.prizes);
  const total = criteria.items.reduce((sum, c) => sum + c.weight, 0);
  if (criteria.bad) return `Baris “${criteria.bad}” belum benar. Tulis: kriteria | bobot.`;
  if (criteria.items.length > 0 && total !== 100) {
    return `Bobot kriteria harus berjumlah 100, sekarang ${total}.`;
  }
  if (criteria.items.length === 0 || prizes.length === 0) {
    return "Lomba butuh kriteria berbobot dan minimal satu hadiah.";
  }
  return { kind: "lomba", criteria: criteria.items, prizes, anonymous: input.anonymous };
}

const BLOCKS: Record<ProjectInput["category"], (input: ProjectInput) => BlockResult> = {
  antologi: antologiBlock,
  solo: soloBlock,
  kelas: kelasBlock,
  lomba: lombaBlock,
};

function block(input: ProjectInput, errors: InputErrors): CategoryBlock | null {
  const result = BLOCKS[input.category](input);
  if (typeof result === "string") {
    errors.block = result;
    return null;
  }
  return result;
}

export function slugFor(input: ProjectInput, taken: readonly string[]): string {
  const fromTitle = input.title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  const base = `${input.category}-${fromTitle || "proyek"}`;
  let slug = base;
  for (let n = 2; taken.includes(slug); n += 1) slug = `${base}-${n}`;
  return slug;
}

/** "v1" becomes "v2"; anything else gets a revision suffix. */
export function nextTermsVersion(version: string): string {
  const match = /^v(\d+)$/.exec(version);
  return match ? `v${Number(match[1]) + 1}` : `${version}-r2`;
}

/** New terms version only when a published project's special terms actually changed (PRJ-03). */
function termsFor(
  existing: ProjectFixture | undefined,
  special: string[],
): { terms: ProjectFixture["terms"]; changed: boolean } {
  if (!existing) return { terms: { version: "v1", special }, changed: false };
  const changed =
    existing.publication === "terbit" && existing.terms.special.join("\n") !== special.join("\n");
  const version = changed ? nextTermsVersion(existing.terms.version) : existing.terms.version;
  return { terms: { version, special }, changed };
}

/**
 * Every rule that fails is named, none dropped (like the other forms). A new project is a draft;
 * changing the terms of a published one starts a new terms version, so people already registered
 * can be told (PRJ-03).
 */
/** What may not change once a project exists, is archived, or has participants (BR-PRJ-07). */
function lockErrors(input: ProjectInput, ctx: BuildContext): InputErrors {
  const { existing, taken } = ctx;
  if (!existing) return {};
  if (existing.publication === "arsip")
    return { title: "Proyek ini diarsipkan dan tidak bisa diubah." };
  const errors: InputErrors = {};
  if (input.category !== existing.category) errors.category = "Kategori tidak bisa diganti.";
  if (taken > 0 && input.zone !== existing.timeZone) {
    errors.zone = "Zona waktu tidak bisa diubah setelah ada peserta.";
  }
  if (taken > 0 && !sameFee(input, existing)) {
    errors.feeIdr = "Biaya tidak bisa diubah setelah ada peserta.";
  }
  return errors;
}

function sameFee(input: ProjectInput, existing: ProjectFixture): boolean {
  const { fee } = feeOf(input.feeIdr, input.feeMyr);
  return fee.idr === existing.fee.idr && fee.myr === existing.fee.myr;
}

export function buildProject(input: ProjectInput, ctx: BuildContext): BuildResult {
  const errors: InputErrors = { ...basics(input), ...lockErrors(input, ctx) };
  const when = schedule(input, errors, ctx.existing);
  const { fee, quota } = money(input, errors, ctx);
  const rules = submission(input, errors);
  const categoryBlock = block(input, errors);
  if (Object.keys(errors).length > 0 || !categoryBlock) return { ok: false, errors };

  const { existing } = ctx;
  const { terms, changed } = termsFor(existing, linesOf(input.special));
  return {
    ok: true,
    project: {
      slug: existing?.slug ?? slugFor(input, ctx.slugs),
      category: input.category,
      publication: existing?.publication ?? "draf",
      title: input.title.trim(),
      summary: input.summary.trim(),
      about: paragraphsOf(input.about),
      requirements: linesOf(input.requirements),
      submission: rules,
      organizer: existing?.organizer ?? "Tim RanahMenulis",
      ownerId: existing?.ownerId ?? ctx.ownerId,
      termsUpdatedAt: changed ? ctx.now : existing?.termsUpdatedAt,
      timeZone: input.zone,
      fee,
      quota,
      terms,
      block: categoryBlock,
      poster: input.posterId ? { fileId: input.posterId, alt: input.posterAlt.trim() } : undefined,
      closesInMs: null,
      milestones: [],
      absolute: { closesAt: when.closesAt, milestones: when.milestones },
    },
  };
}
