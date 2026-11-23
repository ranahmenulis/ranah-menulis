import { describe, expect, it } from "vitest";
import { notifications as en } from "@/features/notifications/copy/en";
import { notifications as id } from "@/features/notifications/copy/id";
import { textOf } from "@/features/notifications/notification-text";
import type { Notification } from "@/features/notifications/types";

const staff = (key: string, params: Record<string, string>): Notification => ({
  id: "x",
  kind: "project",
  actorId: null,
  others: 0,
  message: { key, params },
  href: null,
  agoMs: 0,
});

const KEYS = [
  "staffRevisionSent",
  "staffEditorAssigned",
  "staffMentorHandIn",
  "staffJuryReady",
  "staffJuryAnonymous",
];

describe("staff notification messages", () => {
  it("has every staff key in both languages with the same placeholders", () => {
    const holes = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();
    for (const key of KEYS) {
      const a = (id.messages as Record<string, string>)[key];
      const b = (en.messages as Record<string, string>)[key];
      expect(a).toBeTruthy();
      expect(b).toBeTruthy();
      expect(holes(b)).toEqual(holes(a));
    }
  });

  it("renders Indonesian and English sentences", () => {
    const params = { title: "Judul", project: "Proyek" };
    const assigned = staff("staffEditorAssigned", params);
    expect(textOf(assigned)).toBe("Kiriman “Judul” di Proyek ditugaskan kepadamu.");
    expect(textOf(assigned, en.messages, "en")).toBe(
      "The submission “Judul” in Proyek was assigned to you.",
    );
    const anon = staff("staffJuryAnonymous", { n: "3", project: "Lomba" });
    expect(textOf(anon)).toBe("Karya 3 di Lomba siap dinilai.");
    expect(textOf(anon, en.messages, "en")).toBe("Work 3 in Lomba is ready to be scored.");
  });
});
