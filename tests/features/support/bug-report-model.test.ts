import { describe, expect, it } from "vitest";
import { browserBrief, buildContext } from "@/features/support/bug-report-context";
import {
  DESCRIPTION_LIMIT,
  STEPS_LIMIT,
  applyBugFilter,
  bugRows,
  countBugs,
  excerptOf,
  nextStatuses,
  parseBugFilter,
  statusOf,
  validateBugReport,
  type BugLogEntry,
  type BugReport,
} from "@/features/support/bug-report-model";

const report = (id: string, at: number): BugReport => ({
  id,
  category: "save",
  description: `Masalah ${id}`,
  reporterId: "me",
  at,
});

describe("validateBugReport", () => {
  it("accepts a type and a description, with the steps left out", () => {
    expect(
      validateBugReport({ category: "save", description: "Tidak tersimpan", steps: "" }),
    ).toEqual({});
  });

  it("asks for a type and for the description, one problem per field", () => {
    expect(validateBugReport({ category: "", description: "  ", steps: "" })).toEqual({
      category: "categoryRequired",
      description: "descriptionEmpty",
    });
    expect(validateBugReport({ category: "lain", description: "x", steps: "" }).category).toBe(
      "categoryRequired",
    );
  });

  it("holds the text to its limits", () => {
    const long = (n: number) => "a".repeat(n);
    expect(
      validateBugReport({ category: "other", description: long(DESCRIPTION_LIMIT), steps: "" }),
    ).toEqual({});
    expect(
      validateBugReport({
        category: "other",
        description: long(DESCRIPTION_LIMIT + 1),
        steps: long(STEPS_LIMIT + 1),
      }),
    ).toEqual({ description: "descriptionTooLong", steps: "stepsTooLong" });
  });
});

describe("status", () => {
  const log: BugLogEntry[] = [
    { reportId: "a", status: "diproses", by: "me", at: 2 },
    { reportId: "b", status: "diproses", by: "me", at: 3 },
    { reportId: "a", status: "selesai", by: "me", at: 4 },
  ];

  it("is the last thing done to the report, and new when nothing was done", () => {
    expect(statusOf(log, "a")).toBe("selesai");
    expect(statusOf(log, "b")).toBe("diproses");
    expect(statusOf(log, "c")).toBe("baru");
  });

  it("only moves forward, and a finished report stays finished", () => {
    expect(nextStatuses("baru")).toEqual(["diproses", "selesai"]);
    expect(nextStatuses("diproses")).toEqual(["selesai"]);
    expect(nextStatuses("selesai")).toEqual([]);
  });

  it("lists newest first, filters by status, and opens on Baru", () => {
    const rows = bugRows([report("a", 1), report("b", 2), report("c", 3)], log);
    expect(rows.map((r) => r.report.id)).toEqual(["c", "b", "a"]);
    expect(applyBugFilter(rows, "baru").map((r) => r.report.id)).toEqual(["c"]);
    expect(applyBugFilter(rows, "semua")).toHaveLength(3);
    expect(countBugs(rows)).toEqual({ baru: 1, diproses: 1, selesai: 1, semua: 3 });
    expect(parseBugFilter(null)).toBe("baru");
    expect(parseBugFilter("selesai")).toBe("selesai");
    expect(parseBugFilter("lain")).toBe("baru");
  });
});

describe("excerptOf", () => {
  it("flattens line breaks and cuts long text", () => {
    expect(excerptOf("baris satu\n\nbaris   dua")).toBe("baris satu baris dua");
    expect(excerptOf("a".repeat(100), 10)).toHaveLength(10);
  });
});

describe("technical info", () => {
  it("names the browser and the system, not the whole user agent", () => {
    expect(
      browserBrief(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
      ),
    ).toBe("Chrome · Windows");
    expect(
      browserBrief(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1",
      ),
    ).toBe("Safari · iOS");
    expect(browserBrief("curl/8")).toBe("");
  });

  it("keeps the address only, never a query or a fragment", () => {
    const context = buildContext({
      path: "/studio/abc?token=rahasia#bagian",
      language: "id",
      theme: "dark",
      width: 390.4,
      height: 844,
      userAgent: "",
    });
    expect(context.path).toBe("/studio/abc");
    expect(context.screen).toBe("390 × 844");
  });
});
