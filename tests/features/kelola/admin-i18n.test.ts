import { describe, expect, it } from "vitest";
import { adminCopy, adminMessage, moderationCopy } from "@/features/kelola/admin/copy/admin-copy";
import { kelolaAdmin as adminEn } from "@/features/kelola/admin/copy/en";
import { kelolaAdmin as adminId } from "@/features/kelola/admin/copy/id";
import { kelolaModeration as moderationEn } from "@/features/kelola/admin/copy/moderation-en";
import { kelolaModeration as moderationId } from "@/features/kelola/admin/copy/moderation-id";
import { blockMessage, blockText } from "@/features/kelola/admin/role-rules";
import { caseFilters, decisionLabel } from "@/features/kelola/admin/moderation/moderation-model";
import {
  linkMessage,
  linkProblemText,
  validateCommunityLink,
} from "@/features/kelola/admin/settings/settings-model";
import { personLabel } from "@/features/kelola/admin/people";
import { reportReasonLabel, REPORT_REASON_LABEL } from "@/features/community/moderation/reasons";

function paths(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    paths(child, prefix ? `${prefix}.${key}` : key),
  );
}

function placeholders(text: string): string[] {
  return (text.match(/\{\w+\}/g) ?? []).toSorted();
}

function leaves(value: unknown, out: Record<string, string> = {}, prefix = "") {
  if (typeof value === "string") out[prefix] = value;
  else if (typeof value === "object" && value !== null) {
    for (const [key, child] of Object.entries(value)) {
      leaves(child, out, prefix ? `${prefix}.${key}` : key);
    }
  }
  return out;
}

describe("Kelola Admin dictionaries", () => {
  it("has the same keys and placeholders in English and Indonesian", () => {
    expect(paths(adminEn)).toEqual(paths(adminId));
    expect(paths(moderationEn)).toEqual(paths(moderationId));
    for (const [id, en] of [
      [leaves(adminId), leaves(adminEn)],
      [leaves(moderationId), leaves(moderationEn)],
    ]) {
      for (const key of Object.keys(id)) {
        expect(placeholders(en[key]), key).toEqual(placeholders(id[key]));
      }
    }
  });

  it("picks the copy for the language", () => {
    expect(adminCopy("en").tabs.users).toBe("Users");
    expect(adminCopy("id").tabs.users).toBe("Pengguna");
    expect(moderationCopy("en").filters.baru).toBe("New");
  });
});

describe("Admin results and rules", () => {
  it("keeps the Indonesian rule sentences and words them in English", () => {
    expect(blockMessage["bukan-wewenang"]).toBe(
      "Hanya Administrator dan Super Admin yang bisa mengubah role.",
    );
    expect(blockText("bukan-wewenang", "en")).toBe(
      "Only Administrators and Super Admins can change roles.",
    );
  });

  it("translates a coded result and its role and decision params", () => {
    const granted = {
      message: "",
      code: "granted" as const,
      params: { name: "Ana", role: "juri" },
    };
    expect(adminMessage(granted, "id")).toBe("Ana kini Juri.");
    expect(adminMessage(granted, "en")).toBe("Ana is now Judge.");
    const decided = { message: "", code: "decided" as const, params: { decision: "hapus" } };
    expect(adminMessage(decided, "id")).toBe("Hapus: selesai.");
    expect(adminMessage(decided, "en")).toBe("Delete: done.");
  });

  it("falls back to the message when a result has no code", () => {
    expect(adminMessage({ message: "Apa adanya." }, "en")).toBe("Apa adanya.");
  });

  it("labels people and moderation words in both languages", () => {
    expect(personLabel("tidak-ada", "en")).toBe("tidak-ada");
    expect(decisionLabel.sembunyikan).toBe("Sembunyikan");
    expect(caseFilters("en").map((f) => f.label)).toEqual(["New", "Done", "All"]);
    expect(caseFilters("id").map((f) => f.label)).toEqual(["Baru", "Selesai", "Semua"]);
    expect(REPORT_REASON_LABEL.spam).toBe("Spam atau iklan");
    expect(reportReasonLabel("spam", "en")).toBe("Spam or advertising");
  });

  it("words link problems in the interface language", () => {
    const problem = validateCommunityLink("");
    expect(problem).toBe("kosong");
    expect(linkMessage.kosong).toBe("Tulis alamat tautan komunitas.");
    expect(linkProblemText("kosong", "en")).toBe("Write the community link address.");
    expect(linkProblemText("terlalu-panjang", "en")).toMatch(/at most \d+ characters/);
  });
});
