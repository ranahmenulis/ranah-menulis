import { describe, expect, it } from "vitest";
import type { AssignmentRow } from "@/features/projects/kelas/class-model";
import {
  ANONYMOUS_NAME,
  TESTIMONIAL_LIMIT,
  isHidden,
  publicName,
  validateTestimonial,
  visibleTestimonials,
  writeBlock,
  type Testimonial,
  type TestimonialDecision,
} from "@/features/projects/kelas/testimonial-model";

const t = (over: Partial<Testimonial> = {}): Testimonial => ({
  id: "t1",
  slug: "kelas",
  authorId: "a",
  name: "Ayu",
  text: "Bagus",
  showName: false,
  createdAt: 1,
  updatedAt: 1,
  ...over,
});
const decision = (state: TestimonialDecision["state"], at: number, id = "t1") => ({
  testimonialId: id,
  state,
  at,
  by: "x",
});
const row = (state: AssignmentRow["state"]) => ({ state }) as AssignmentRow;

describe("testimonial text", () => {
  it("must not be empty, and has a limit counted in characters", () => {
    expect(validateTestimonial("   ")).toBe("kosong");
    expect(validateTestimonial("a".repeat(TESTIMONIAL_LIMIT))).toBeNull();
    expect(validateTestimonial("a".repeat(TESTIMONIAL_LIMIT + 1))).toBe("terlalu-panjang");
    // An emoji is one character, not two.
    expect(validateTestimonial("😀".repeat(TESTIMONIAL_LIMIT))).toBeNull();
  });
});

describe("who may write", () => {
  it("needs a started class and a task marked Selesai", () => {
    expect(writeBlock(false, [row("selesai")])).toBe("belum-mulai");
    expect(writeBlock(true, [row("dikumpulkan"), row("perlu-perbaikan")])).toBe(
      "belum-ada-tugas-selesai",
    );
    expect(writeBlock(true, [row("belum-dikumpulkan"), row("selesai")])).toBeNull();
  });
});

describe("hiding", () => {
  it("is decided by the last decision about a testimonial", () => {
    expect(isHidden("t1", [])).toBe(false);
    expect(isHidden("t1", [decision("disembunyikan", 1)])).toBe(true);
    expect(isHidden("t1", [decision("disembunyikan", 1), decision("dipulihkan", 2)])).toBe(false);
    expect(isHidden("t1", [decision("disembunyikan", 1, "other")])).toBe(false);
  });

  it("leaves hidden ones and other classes out, newest first", () => {
    const all = [
      t({ id: "old", updatedAt: 1 }),
      t({ id: "new", updatedAt: 5 }),
      t({ id: "gone", updatedAt: 9 }),
      t({ id: "elsewhere", slug: "lain", updatedAt: 9 }),
    ];
    const shown = visibleTestimonials(all, [decision("disembunyikan", 1, "gone")], "kelas");
    expect(shown.map((x) => x.id)).toEqual(["new", "old"]);
  });
});

describe("the name shown", () => {
  it("is the real name only when the participant agreed", () => {
    expect(publicName(t({ showName: true }))).toBe("Ayu");
    expect(publicName(t({ showName: false }))).toBe(ANONYMOUS_NAME);
    expect(publicName(t({ showName: true, name: "  " }))).toBe(ANONYMOUS_NAME);
  });
});
