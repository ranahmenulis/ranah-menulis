import { CLASS_START_LABEL } from "@/features/projects/kelas/class-model";
import type { CategoryBlock, ProjectFixture, SubmissionRules } from "@/features/projects/types";
import { isOpenService, takesSubmissions, type ProjectInput } from "./project-input";
import {
  newIssues,
  report,
  type InputErrors,
  type InputProblems,
  type Issues,
  type Problem,
} from "./project-problem";
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
  | { ok: true; project: ProjectFixture }
  | { ok: false; errors: InputErrors; problems: InputProblems };

const whole = (text: string, min: number, max: number): number | null => {
  const t = text.trim().replace(/\./g, "");
  if (!/^\d{1,9}$/.test(t)) return null;
  const n = Number(t);
  return n >= min && n <= max ? n : null;
};

function basics(input: ProjectInput, issues: Issues): void {
  const title = input.title.trim();
  if (!title) report(issues, "title", "titleRequired");
  else if (title.length > TITLE_LIMIT) report(issues, "title", "titleLong", { max: TITLE_LIMIT });
  const summary = input.summary.trim();
  if (!summary) report(issues, "summary", "summaryRequired");
  else if (summary.length > SUMMARY_LIMIT) {
    report(issues, "summary", "summaryLong", { max: SUMMARY_LIMIT });
  }
  const about = input.about.trim();
  if (!about) report(issues, "about", "aboutRequired");
  else if (about.length > ABOUT_LIMIT) report(issues, "about", "aboutLong", { max: ABOUT_LIMIT });
  if (linesOf(input.requirements).length === 0) {
    report(issues, "requirements", "requirementsRequired");
  }
  const alt = input.posterAlt.trim();
  if (input.posterId && !alt) {
    report(issues, "posterAlt", "posterAltRequired");
  } else if (alt.length > POSTER_ALT_LIMIT) {
    report(issues, "posterAlt", "posterAltLong", { max: POSTER_ALT_LIMIT });
  }
}

type Schedule = { closesAt: number | null; milestones: { label: string; at: number }[] };

function schedule(
  input: ProjectInput,
  issues: Issues,
  existing: ProjectFixture | undefined,
): Schedule {
  // A deadline the Organizer did not touch stays the exact moment it was: "Tutup pendaftaran"
  // stores "just now", and saving the form must not turn that back into the end of today.
  let closesAt: number | null = existing?.absolute?.closesAt ?? null;
  const untouched = closesAt !== null && input.closesDate === dateInputOf(closesAt, input.zone);
  if (!isOpenService(input.category) && !untouched) {
    closesAt = dayEnd(input.closesDate, input.zone);
    if (closesAt === null) report(issues, "closesDate", "closesRequired");
  }
  const parsed = parseMilestones(input.milestones, input.zone);
  if (parsed.bad) {
    report(issues, "milestones", "milestonesBad", { line: parsed.bad });
  } else if (
    input.category === "kelas" &&
    !parsed.items.some((m) => m.label === CLASS_START_LABEL)
  ) {
    report(issues, "milestones", "milestonesClassStart", { label: CLASS_START_LABEL });
  }
  return { closesAt, milestones: parsed.items };
}

function money(input: ProjectInput, issues: Issues, ctx: BuildContext) {
  if (isOpenService(input.category)) return { fee: {}, quota: null };
  const { fee, bad } = feeOf(input.feeIdr, input.feeMyr);
  if (bad === "idr") report(issues, "feeIdr", "feeIdrBad");
  if (bad === "myr") report(issues, "feeMyr", "feeMyrBad");
  let quota: { total: number; taken: number } | null = null;
  if (input.quota.trim()) {
    const total = whole(input.quota, 1, 100_000);
    if (total === null) report(issues, "quota", "quotaBad");
    else if (total < ctx.taken) {
      report(issues, "quota", "quotaBelow", { taken: ctx.taken });
    } else quota = { total, taken: ctx.existing?.quota?.taken ?? 0 };
  }
  return { fee, quota };
}

function submission(input: ProjectInput, issues: Issues): SubmissionRules | null {
  if (!takesSubmissions(input.category)) return null;
  const minWords = whole(input.minWords, 1, 1_000_000);
  const maxWords = whole(input.maxWords, 1, 1_000_000);
  const maxWorks = whole(input.maxWorks, 1, 20);
  if (minWords === null || maxWords === null) {
    report(issues, "minWords", "wordsBad");
  } else if (minWords > maxWords) report(issues, "minWords", "wordsOrder");
  if (maxWorks === null) report(issues, "maxWorks", "worksBad");
  if (minWords === null || maxWords === null || maxWorks === null || minWords > maxWords)
    return null;
  return { minWords, maxWords, maxWorks };
}

type BlockResult = CategoryBlock | Problem;

function antologiBlock(input: ProjectInput): BlockResult {
  const stages = linesOf(input.stages);
  if (!input.theme.trim() || stages.length === 0) {
    return { code: "blockAntologi" };
  }
  return { kind: "antologi", theme: input.theme.trim(), stages };
}

function soloBlock(input: ProjectInput): BlockResult {
  const parsed = parsePackages(input.packages);
  if (parsed.bad) {
    return { code: "blockSoloBad", values: { line: parsed.bad } };
  }
  if (parsed.items.length === 0) return { code: "blockSoloNone" };
  return { kind: "solo", packages: parsed.items };
}

function kelasBlock(input: ProjectInput): BlockResult {
  const modules = parseModules(input.modules);
  if (modules.bad) return { code: "blockKelasBad", values: { line: modules.bad } };
  if (!input.teacherName.trim() || !input.teacherBio.trim() || modules.items.length === 0) {
    return { code: "blockKelasMissing" };
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
  if (criteria.bad) return { code: "blockLombaBad", values: { line: criteria.bad } };
  if (criteria.items.length > 0 && total !== 100) {
    return { code: "blockLombaWeight", values: { total } };
  }
  if (criteria.items.length === 0 || prizes.length === 0) {
    return { code: "blockLombaMissing" };
  }
  return { kind: "lomba", criteria: criteria.items, prizes, anonymous: input.anonymous };
}

const BLOCKS: Record<ProjectInput["category"], (input: ProjectInput) => BlockResult> = {
  antologi: antologiBlock,
  solo: soloBlock,
  kelas: kelasBlock,
  lomba: lombaBlock,
};

function block(input: ProjectInput, issues: Issues): CategoryBlock | null {
  const result = BLOCKS[input.category](input);
  if ("code" in result) {
    report(issues, "block", result.code, result.values);
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
function lockErrors(input: ProjectInput, ctx: BuildContext, issues: Issues): void {
  const { existing, taken } = ctx;
  if (!existing) return;
  if (existing.publication === "arsip") return report(issues, "title", "archived");
  if (input.category !== existing.category) report(issues, "category", "categoryLocked");
  if (taken > 0 && input.zone !== existing.timeZone) report(issues, "zone", "zoneLocked");
  if (taken > 0 && !sameFee(input, existing)) report(issues, "feeIdr", "feeLocked");
}

function sameFee(input: ProjectInput, existing: ProjectFixture): boolean {
  const { fee } = feeOf(input.feeIdr, input.feeMyr);
  return fee.idr === existing.fee.idr && fee.myr === existing.fee.myr;
}

export function buildProject(input: ProjectInput, ctx: BuildContext): BuildResult {
  const issues = newIssues();
  basics(input, issues);
  lockErrors(input, ctx, issues);
  const when = schedule(input, issues, ctx.existing);
  const { fee, quota } = money(input, issues, ctx);
  const rules = submission(input, issues);
  const categoryBlock = block(input, issues);
  if (Object.keys(issues.errors).length > 0 || !categoryBlock) {
    return { ok: false, errors: issues.errors, problems: issues.problems };
  }

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
