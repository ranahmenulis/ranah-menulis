import { cleanup, configure, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NotificationsView } from "@/features/notifications/notifications-view";
import { createMemorySubmissionStore } from "@/features/projects/storage/memory-submission-store";
import { submissionNotifications } from "@/features/projects/submission-notifications";
import { NOW, submission } from "../projects/helpers";

configure({ asyncUtilTimeout: 5000 });

const CERPEN = "lomba-cerpen-hujan-2026";
const DAY = 86_400_000;

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});
afterEach(cleanup);

describe("submissionNotifications", () => {
  it("announces that the system received the work (PRD 20)", () => {
    const [n] = submissionNotifications([submission({ id: "a", slug: CERPEN })]);
    expect(n).toMatchObject({
      id: `sub-a-terkirim-${NOW}`,
      kind: "project",
      at: NOW,
      href: `/projects/${CERPEN}/kiriman/a`,
    });
    expect(n.text).toBe(
      "Karyamu “Buku yang Mengubahku” untuk Lomba Cerpen Hujan 2026 sudah diterima sistem.",
    );
  });

  it("announces the editor's request with the deadline, a decision, and nothing else", () => {
    const work = submission({
      id: "a",
      slug: CERPEN,
      status: "ditolak",
      statusLog: [
        { status: "terkirim", at: NOW - 5 * DAY, by: "sistem" },
        { status: "peninjauan", at: NOW - 4 * DAY, by: "editor" },
        { status: "perlu-revisi", at: NOW - 3 * DAY, by: "editor", dueAt: NOW + 4 * DAY },
        { status: "revisi-terkirim", at: NOW - 2 * DAY, by: "peserta" },
        { status: "ditolak", at: NOW - DAY, by: "editor", reason: "Tidak sesuai tema." },
      ],
    });
    const texts = submissionNotifications([work]).map((n) => n.text);
    expect(texts).toHaveLength(3);
    // Newest first: the decision, then the request, then the first receipt.
    expect(texts[0]).toContain("tidak lolos");
    expect(texts[1]).toContain("Editor meminta revisi");
    expect(texts[1]).toContain("Tenggat revisi 20 Nov 2026");
  });

  it("keeps the same id when an earlier change is added in front of the log", () => {
    const log = [{ status: "terkirim" as const, at: NOW, by: "sistem" as const }];
    const before = submissionNotifications([submission({ id: "a", slug: CERPEN, statusLog: log })]);
    const longer = [{ status: "draf" as const, at: NOW - DAY, by: "peserta" as const }, ...log];
    const after = submissionNotifications([
      submission({ id: "a", slug: CERPEN, statusLog: longer }),
    ]);
    expect(after.map((n) => n.id)).toEqual(before.map((n) => n.id));
  });

  it("lists the newest event first", () => {
    const work = submission({
      id: "a",
      slug: CERPEN,
      statusLog: [
        { status: "terkirim", at: NOW - 2 * DAY, by: "sistem" },
        { status: "diterima", at: NOW - DAY, by: "editor" },
      ],
    });
    expect(submissionNotifications([work]).map((n) => n.at)).toEqual([NOW - DAY, NOW - 2 * DAY]);
  });

  it("leaves out a work whose project no longer exists", () => {
    expect(submissionNotifications([submission({ slug: "tidak-ada" })])).toEqual([]);
  });
});

describe("Notifikasi with submissions", () => {
  it("lists a submission event as unread, newest first, linking to its detail", async () => {
    const store = createMemorySubmissionStore();
    await store.add(submission({ id: "a", slug: CERPEN }), 5);
    render(<NotificationsView store={store} />);

    const link = await screen.findByRole("link", { name: /sudah diterima sistem/ });
    expect(link.getAttribute("href")).toBe(`/projects/${CERPEN}/kiriman/a`);
    expect(screen.getByText("4 belum dibaca.")).toBeTruthy();
    // The work was sent "now" in the test clock, far in the past of the real one: it is not first.
    expect(within(screen.getByRole("list")).getAllByRole("listitem")).toHaveLength(6);
  });

  it("marks the event read when opened, and remembers it", async () => {
    const store = createMemorySubmissionStore();
    await store.add(submission({ id: "a", slug: CERPEN }), 5);
    render(<NotificationsView store={store} />);
    const link = await screen.findByRole("link", { name: /sudah diterima sistem/ });
    link.addEventListener("click", (e) => e.preventDefault());
    fireEvent.click(link);
    expect(JSON.parse(localStorage.getItem("ranah.notificationsRead") ?? "[]")).toEqual([
      `sub-a-terkirim-${NOW}`,
    ]);
  });
});
