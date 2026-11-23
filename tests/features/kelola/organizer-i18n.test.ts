import { describe, expect, it } from "vitest";
import { kelolaOrganizer as en } from "@/features/kelola/organizer/copy/en";
import { kelolaOrganizer as id } from "@/features/kelola/organizer/copy/id";
import { organizerCopy } from "@/features/kelola/organizer/copy/organizer-copy";
import { buildProject } from "@/features/kelola/organizer/project-build";
import { emptyInput } from "@/features/kelola/organizer/project-input";
import { localizeProblems, renderProblem } from "@/features/kelola/organizer/project-problem";

function paths(value: unknown, prefix = ""): string[] {
  if (typeof value === "string") return [prefix];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    paths(child, prefix ? `${prefix}.${key}` : key),
  );
}

const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort();

function leaves(value: unknown, prefix = ""): Record<string, string> {
  return Object.fromEntries(paths(value).map((p) => [p, p]));
}

function at(source: unknown, path: string): string {
  return path
    .split(".")
    .reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], source) as string;
}

describe("Organizer dictionary", () => {
  it("has the same keys and placeholders in both languages", () => {
    expect(paths(en).sort()).toEqual(paths(id).sort());
    for (const path of Object.keys(leaves(id))) {
      expect(placeholders(at(en, path)), path).toEqual(placeholders(at(id, path)));
    }
  });

  it("picks the language for pure modules", () => {
    expect(organizerCopy("en").status.terbit).toBe("Published");
    expect(organizerCopy().status.terbit).toBe("Terbit");
  });
});

describe("project problems", () => {
  it("keeps the Indonesian message and gives a code for each failing rule", () => {
    const result = buildProject(emptyInput(), {
      now: 0,
      taken: 0,
      slugs: [],
      ownerId: "x",
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.title).toBe("Tulis judul proyek.");
    expect(result.problems.title).toEqual({ code: "titleRequired", values: undefined });
    expect(localizeProblems(result.problems, "en").title).toBe("Write the project title.");
    expect(localizeProblems(result.problems, "id")).toEqual(result.errors);
  });

  it("renders values in English", () => {
    expect(renderProblem({ code: "quotaBelow", values: { taken: 5 } }, "en")).toBe(
      "The quota cannot be below the 5 participants already registered.",
    );
    expect(renderProblem({ code: "quotaBelow", values: { taken: 5 } }, "id")).toBe(
      "Kuota tidak boleh di bawah 5 peserta yang sudah terdaftar.",
    );
  });
});
