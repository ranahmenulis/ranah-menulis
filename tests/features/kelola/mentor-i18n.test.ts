import { describe, expect, it } from "vitest";
import { kelolaMentor as en } from "@/features/kelola/mentor/copy/en";
import { kelolaMentor as id } from "@/features/kelola/mentor/copy/id";
import { mentorCopy, pluralOf } from "@/features/kelola/mentor/copy/mentor-copy";
import { mentorFiltersOf, mentorEmptyTextOf, tabsOf } from "@/features/kelola/mentor/mentor-queue";
import { mentorHintOf, mentorStepsFor } from "@/features/kelola/mentor/mentor-review";
import { blockedClassMessageOf } from "@/features/kelola/mentor/mentor-text";
import { dueText } from "@/features/projects/kelas/class-text";
import { validateTask } from "@/features/projects/kelas/mentor-tasks";
import { handedIn } from "../projects/kelas/helpers";

function paths(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    paths(child, prefix ? `${prefix}.${key}` : key),
  );
}

function placeholders(value: unknown): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  const walk = (node: unknown, path: string) => {
    if (typeof node === "string") {
      out[path] = [...node.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    } else if (typeof node === "object" && node !== null) {
      for (const [k, v] of Object.entries(node)) walk(v, path ? `${path}.${k}` : k);
    }
  };
  walk(value, "");
  return out;
}

describe("kelolaMentor dictionary", () => {
  it("has the same keys and placeholders in both languages", () => {
    expect(paths(en)).toEqual(paths(id));
    expect(placeholders(en)).toEqual(placeholders(id));
  });

  it("picks the dictionary by locale", () => {
    expect(mentorCopy("en")).toBe(en);
    expect(mentorCopy()).toBe(id);
  });
});

describe("Mentor pure helpers", () => {
  it("keeps Indonesian output and offers English", () => {
    expect(mentorFiltersOf("id").map((f) => f.label)).toEqual([
      "Perlu dinilai",
      "Menunggu perbaikan",
      "Selesai",
      "Semua",
    ]);
    expect(mentorFiltersOf("en")[0].label).toBe("To review");
    expect(tabsOf("en").map((t) => t.label)).toEqual(["Hand-ins", "Tasks", "Participants"]);
    expect(mentorEmptyTextOf("selesai", "en")).toBe("You have not marked any task as done yet.");
    expect(blockedClassMessageOf("tidak-ditugaskan")).toBe("Kelas ini tidak ditugaskan kepadamu.");
    expect(blockedClassMessageOf("tidak-ditugaskan", "en")).toBe(
      "This class is not assigned to you.",
    );
  });

  it("labels the review steps and hints in English", () => {
    const work = handedIn({ status: "dikumpulkan" });
    expect(mentorStepsFor(work).map((s) => s.label)).toEqual(["Minta perbaikan", "Tandai selesai"]);
    expect(mentorStepsFor(work, "en").map((s) => s.label)).toEqual([
      "Request repair",
      "Mark as done",
    ]);
    expect(mentorHintOf("selesai", "en")).toBe("You have marked this task as done.");
  });

  it("pluralizes English only", () => {
    expect(pluralOf("1 task", "2 tasks", 1, "en")).toBe("1 task");
    expect(pluralOf("1 task", "2 tasks", 2, "en")).toBe("2 tasks");
    expect(pluralOf("satu", "banyak", 1, "id")).toBe("banyak");
  });

  it("translates task validation and due text", () => {
    const empty = { title: "", instructions: "", dueDate: "" };
    const context = { zone: "WIB" as const, now: 0 };
    expect(validateTask(empty, context).title).toBe("Tulis judul tugas.");
    expect(validateTask(empty, { ...context, locale: "en" }).title).toBe(
      "Write a title for the assignment.",
    );
    expect(dueText(Date.UTC(2026, 10, 30, 12), "WIB", "en")).toMatch(/Due/i);
  });
});
