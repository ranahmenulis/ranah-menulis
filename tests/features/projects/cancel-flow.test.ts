import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cancelBlock, cancelMessage, canOfferCancel } from "@/features/projects/cancel-model";
import { cancelOwnRegistration } from "@/features/projects/cancel-flow";
import { cancellationLog } from "@/features/projects/cancellation-log";
import { readRegistrations, saveRegistration } from "@/features/projects/registration-store";
import { createMemoryAssignmentStore } from "@/features/projects/kelas/storage/memory-assignment-store";
import { createMemorySubmissionStore } from "@/features/projects/storage/memory-submission-store";
import type { AssignmentSubmission } from "@/features/projects/kelas/types";
import { NOW, project, registration, submission } from "./helpers";

const FREE_LOMBA = "lomba-esai-literasi-remaja";
const FREE_CLASS = "kelas-cerpen-untuk-pemula";
const base = { sentCount: 0, handedIn: 0, contestStage: "terbuka" } as const;

beforeEach(() => {
  localStorage.clear();
  cancellationLog.reset();
});
afterEach(() => localStorage.clear());

describe("cancelBlock", () => {
  const free = project(FREE_CLASS);
  const reg = registration(FREE_CLASS);

  it("lets a confirmed registration on a free project go", () => {
    expect(canOfferCancel(free, reg)).toBe(true);
    expect(cancelBlock({ ...base, project: free, registration: reg })).toBeNull();
  });

  it("gives paid projects no way out, including Solo with a paid package", () => {
    const paid = project("lomba-cerpen-hujan-2026");
    expect(canOfferCancel(paid, registration(paid.slug))).toBe(false);
    expect(cancelBlock({ ...base, project: paid, registration: registration(paid.slug) })).toBe(
      "berbayar",
    );
    const solo = project("solo-penerbitan-buku-sendiri");
    expect(canOfferCancel(solo, registration(solo.slug, { packageName: "Terbit Lengkap" }))).toBe(
      false,
    );
  });

  it("refuses while works are in review, tasks are handed in, or a contest is being judged", () => {
    const input = { project: free, registration: reg };
    expect(cancelBlock({ ...base, ...input, sentCount: 1 })).toBe("ada-kiriman");
    expect(cancelBlock({ ...base, ...input, handedIn: 1 })).toBe("ada-tugas");
    const lomba = project(FREE_LOMBA);
    expect(
      cancelBlock({
        ...base,
        project: lomba,
        registration: registration(FREE_LOMBA),
        contestStage: "dinilai",
      }),
    ).toBe("lomba-dinilai");
    expect(cancelBlock({ ...base, project: free, registration: undefined })).toBe("tidak-ada");
  });

  it("says what to do about works that are still in review", () => {
    expect(cancelMessage("ada-kiriman")).toMatch(/Tarik karyamu dulu/);
  });
});

describe("cancelOwnRegistration", () => {
  const stores = () => ({
    submissions: createMemorySubmissionStore(),
    assignments: createMemoryAssignmentStore(),
  });

  it("removes the registration, frees the seat, and records the cancellation", async () => {
    const p = project(FREE_CLASS);
    saveRegistration(registration(FREE_CLASS));
    const result = await cancelOwnRegistration({ project: p, ...stores(), now: NOW });
    expect(result).toEqual({ kind: "cancelled" });
    expect(readRegistrations()[FREE_CLASS]).toBeUndefined();
    expect(cancellationLog.read()).toEqual([
      expect.objectContaining({ slug: FREE_CLASS, cancelledAt: NOW }),
    ]);
  });

  it("allows registering again afterwards", async () => {
    const p = project(FREE_CLASS);
    saveRegistration(registration(FREE_CLASS));
    await cancelOwnRegistration({ project: p, ...stores(), now: NOW });
    saveRegistration(registration(FREE_CLASS, { registeredAt: NOW + 5 }));
    expect(readRegistrations()[FREE_CLASS]?.registeredAt).toBe(NOW + 5);
  });

  it("refuses and keeps everything when a work was sent, but ignores withdrawn ones", async () => {
    const p = project(FREE_LOMBA);
    saveRegistration(registration(FREE_LOMBA));
    const s = stores();
    await s.submissions.add(submission({ id: "a", slug: FREE_LOMBA }), 5);
    const refused = await cancelOwnRegistration({ project: p, ...s, now: NOW });
    expect(refused).toEqual({ kind: "blocked", block: "ada-kiriman" });
    expect(readRegistrations()[FREE_LOMBA]).toBeDefined();
    expect(cancellationLog.read()).toHaveLength(0);

    const withdrawn = stores();
    await withdrawn.submissions.add(
      submission({ id: "b", slug: FREE_LOMBA, status: "ditarik" }),
      5,
    );
    expect((await cancelOwnRegistration({ project: p, ...withdrawn, now: NOW })).kind).toBe(
      "cancelled",
    );
  });

  it("refuses a class with a handed-in task and a contest past its deadline", async () => {
    const cls = project(FREE_CLASS);
    saveRegistration(registration(FREE_CLASS));
    const s = stores();
    await s.assignments.add({
      id: "t1",
      slug: FREE_CLASS,
      assignmentId: "x",
    } as AssignmentSubmission);
    expect(await cancelOwnRegistration({ project: cls, ...s, now: NOW })).toEqual({
      kind: "blocked",
      block: "ada-tugas",
    });

    const lomba = project(FREE_LOMBA);
    saveRegistration(registration(FREE_LOMBA));
    const late = (lomba.closesAt ?? NOW) + 24 * 60 * 60 * 1000;
    expect(await cancelOwnRegistration({ project: lomba, ...stores(), now: late })).toEqual({
      kind: "blocked",
      block: "lomba-dinilai",
    });
  });

  it("reports a missing registration instead of pretending to cancel", async () => {
    expect(
      await cancelOwnRegistration({ project: project(FREE_CLASS), ...stores(), now: NOW }),
    ).toEqual({ kind: "blocked", block: "tidak-ada" });
  });
});
