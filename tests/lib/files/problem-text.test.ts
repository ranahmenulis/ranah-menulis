import { describe, expect, it } from "vitest";
import {
  restoreArchivedMessage,
  RESTORE_ARCHIVED_MESSAGE,
} from "@/features/studio/document-archive";
import { problemText, type FileProblem } from "@/lib/files/problem-text";
import type { UploadKind } from "@/lib/files/validate-upload";

const PROBLEMS: FileProblem[] = ["type", "size", "empty", "unreadable", "store"];
const KINDS: UploadKind[] = ["image", "manuscript", "preview"];

describe("problemText", () => {
  it("has a sentence for every problem and kind in both languages", () => {
    for (const locale of ["id", "en"] as const) {
      for (const problem of PROBLEMS) {
        for (const kind of KINDS) {
          expect(problemText(problem, kind, locale).length).toBeGreaterThan(5);
        }
      }
    }
  });

  it("defaults to Indonesian and states the limit in megabytes", () => {
    expect(problemText("type", "image")).toBe("Pilih gambar JPG, PNG, atau WebP.");
    expect(problemText("size", "manuscript", "id")).toMatch(/Maksimal \d+ MB/);
    expect(problemText("size", "manuscript", "en")).toMatch(/limit is \d+ MB/);
  });

  it("is different in English", () => {
    for (const problem of PROBLEMS) {
      expect(problemText(problem, "image", "en")).not.toBe(problemText(problem, "image", "id"));
    }
  });

  it("names an image or a file depending on the kind when unreadable", () => {
    expect(problemText("unreadable", "image", "en")).toMatch(/image/);
    expect(problemText("unreadable", "manuscript", "en")).toMatch(/file/);
  });
});

describe("restoreArchivedMessage", () => {
  it("keeps the Indonesian constant and has an English sentence", () => {
    expect(restoreArchivedMessage("id")).toBe(RESTORE_ARCHIVED_MESSAGE);
    expect(restoreArchivedMessage("en")).toMatch(/Archive/);
  });
});
