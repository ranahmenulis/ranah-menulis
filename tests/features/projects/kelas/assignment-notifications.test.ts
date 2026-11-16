import { describe, expect, it } from "vitest";
import { assignmentNotifications } from "@/features/projects/kelas/assignment-notifications";
import { withMentorDecision } from "@/features/projects/kelas/assignment-status";
import { CERPEN, handedIn } from "./helpers";
import { NOW } from "../helpers";

describe("assignmentNotifications", () => {
  it("announces only what the mentor did, newest first, each linking to the assignment", () => {
    const repair = withMentorDecision(handedIn({ id: "a" }), "perlu-perbaikan", {
      now: NOW + 10,
      reason: "Ubah.",
    })!;
    const done = withMentorDecision(handedIn({ id: "b", assignmentId: "tugas-2" }), "selesai", {
      now: NOW + 20,
    })!;
    const out = assignmentNotifications([repair, done]);
    expect(out.map((n) => n.text)).toEqual([
      "Mentor menandai tugas “Profil singkat tokoh utama” di Kelas Cerpen untuk Pemula selesai.",
      "Mentor meminta perbaikan untuk tugas “Kerangka cerpenmu” di Kelas Cerpen untuk Pemula.",
    ]);
    expect(out[0]).toMatchObject({
      kind: "project",
      href: `/projects/${CERPEN}/tugas/tugas-2`,
      at: NOW + 20,
    });
    expect(new Set(out.map((n) => n.id)).size).toBe(2);
  });

  it("says nothing about a hand-in nobody has decided, or about a class that is gone", () => {
    expect(assignmentNotifications([handedIn()])).toEqual([]);
    const gone = withMentorDecision(handedIn({ slug: "hilang" }), "selesai", { now: NOW })!;
    expect(assignmentNotifications([gone])).toEqual([]);
  });
});
