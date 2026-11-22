import type { Locale } from "@/lib/i18n/config";
import { fill } from "@/features/studio/copy/fill";
import { classCopy } from "./class-copy";
import type { AssignmentRow } from "./class-model";

/** [usulan] Longest testimonial, in characters. */
export const TESTIMONIAL_LIMIT = 300;

/** What the page shows instead of a name when the participant did not agree to show theirs. */
export const ANONYMOUS_NAME = "Peserta kelas";

/** A participant's words about a class (KLS-07). One per participant per class. */
export type Testimonial = {
  id: string;
  slug: string;
  authorId: string;
  /** The account name when it was written; shown only when `showName` is true. */
  name: string;
  text: string;
  /** The participant's own choice, never on by itself. */
  showName: boolean;
  createdAt: number;
  updatedAt: number;
  /** A made-up example in the fixtures [konfirmasi]; real ones come from participants. */
  sample?: boolean;
};

/** A curator's decision. Append-only: the last one for a testimonial says where it stands. */
export type TestimonialDecision = {
  testimonialId: string;
  state: "disembunyikan" | "dipulihkan";
  at: number;
  by: string;
  reason?: string;
};

export const testimonialId = (slug: string, authorId: string, createdAt: number) =>
  `${slug}:${authorId}:${createdAt}`;

export type TestimonialProblem = "kosong" | "terlalu-panjang";

export function validateTestimonial(text: string): TestimonialProblem | null {
  const trimmed = text.trim();
  if (trimmed === "") return "kosong";
  return [...trimmed].length > TESTIMONIAL_LIMIT ? "terlalu-panjang" : null;
}

export const testimonialMessage: Record<TestimonialProblem, string> = {
  kosong: "Tulis testimonimu dulu.",
  "terlalu-panjang": `Testimoni paling banyak ${TESTIMONIAL_LIMIT} karakter.`,
};

/** Why a participant cannot write one yet; `null` means they can. */
export type WriteBlock = "belum-mulai" | "belum-ada-tugas-selesai";

/** [usulan] Only someone who took part: the class started and a task of theirs is marked Selesai. */
export function writeBlock(started: boolean, rows: readonly AssignmentRow[]): WriteBlock | null {
  if (!started) return "belum-mulai";
  return rows.some((r) => r.state === "selesai") ? null : "belum-ada-tugas-selesai";
}

export const writeBlockText: Record<WriteBlock, string> = {
  "belum-mulai": "Kamu bisa menulis testimoni setelah kelas dimulai.",
  "belum-ada-tugas-selesai":
    "Kamu bisa menulis testimoni setelah satu tugasmu dinilai Selesai oleh mentor.",
};

/** Hidden when the last decision about it says so. Decisions are in the order they were made. */
export function isHidden(id: string, decisions: readonly TestimonialDecision[]): boolean {
  return decisions.findLast((d) => d.testimonialId === id)?.state === "disembunyikan";
}

export const latestDecision = (id: string, decisions: readonly TestimonialDecision[]) =>
  decisions.findLast((d) => d.testimonialId === id);

/** What a reader of the class page sees: not hidden, newest first. */
export function visibleTestimonials(
  all: readonly Testimonial[],
  decisions: readonly TestimonialDecision[],
  slug: string,
): Testimonial[] {
  return all
    .filter((t) => t.slug === slug && !isHidden(t.id, decisions))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export const publicName = (
  t: Pick<Testimonial, "name" | "showName">,
  anonymous: string = ANONYMOUS_NAME,
) => (t.showName && t.name.trim() !== "" ? t.name.trim() : anonymous);

/** Why a save or delete answered as it did; `message` on the result is the Indonesian default. */
export type TestimonialCode =
  | "guest"
  | "notRegistered"
  | "classNotFound"
  | "dataUnreadable"
  | "updated"
  | "sent"
  | "deleted"
  | "gone"
  | `problem-${TestimonialProblem}`
  | `block-${WriteBlock}`;

/** The sentence for a result code in the interface language. */
export function testimonialCodeText(code: TestimonialCode, locale: Locale = "id"): string {
  const t = classCopy(locale).testimonial;
  if (code.startsWith("problem-")) {
    const problem = code.slice("problem-".length) as TestimonialProblem;
    return fill(t.problem[problem], { limit: String(TESTIMONIAL_LIMIT) });
  }
  if (code.startsWith("block-")) return t.writeBlock[code.slice("block-".length) as WriteBlock];
  return t.result[code as keyof typeof t.result];
}
