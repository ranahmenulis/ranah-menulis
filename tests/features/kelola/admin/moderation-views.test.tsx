import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(window.location.search),
  usePathname: () => "/kelola/admin/moderasi",
  useRouter: () => ({ push: vi.fn() }),
}));

import { moderation, reports } from "@/features/community/moderation/report-store";
import { createMemoryPostStore } from "@/features/community/storage/memory-store";
import { CaseView } from "@/features/kelola/admin/components/case-view";
import { ModerationQueueView } from "@/features/kelola/admin/components/moderation-queue-view";
import { suspensions } from "@/features/kelola/admin/role-store";
import { AuditView } from "@/features/kelola/audit/audit-view";
import { auditLog } from "@/features/kelola/audit/audit-log";
import { judgingLog } from "@/features/kelola/juri/score-store";
import { installDialogShim } from "@/test/dialog-shim";

installDialogShim();

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  reports.reset();
  moderation.reset();
  suspensions.reset();
  auditLog.reset();
  judgingLog.reset();
  window.history.replaceState(null, "", "/kelola/admin/moderasi");
});
afterEach(cleanup);

describe("moderation queue", () => {
  it("lists the example cases merged, without any reporter", async () => {
    render(<ModerationQueueView store={createMemoryPostStore()} />);
    const list = await screen.findByRole("list", { name: "Kasus" });
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(within(list).getByText(/2 laporan · Spam atau iklan/)).toBeTruthy();
    expect(document.body.textContent).not.toMatch(/Nur Aisyah melapor/);
  });

  it("narrows to finished cases and says when there are none", async () => {
    render(<ModerationQueueView store={createMemoryPostStore()} />);
    await screen.findByRole("list", { name: "Kasus" });
    fireEvent.click(screen.getByRole("button", { name: /^Selesai/ }));
    expect(screen.getByText("Belum ada kasus yang selesai.")).toBeTruthy();
    expect(window.location.search).toBe("?status=selesai");
  });

  it("says when nothing was reported", async () => {
    reports.write([]);
    render(<ModerationQueueView store={createMemoryPostStore()} />);
    expect(await screen.findByText("Tidak ada laporan baru.")).toBeTruthy();
  });
});

describe("a case", () => {
  const key = "post:toples-kerupuk";
  const open = () => render(<CaseView caseKey={key} store={createMemoryPostStore()} />);

  it("says so for an unknown case, with a way out", async () => {
    render(<CaseView caseKey="post:tidak-ada" store={createMemoryPostStore()} />);
    expect(await screen.findByText("Laporan ini tidak ditemukan.")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Antrean moderasi/ }).getAttribute("href")).toBe(
      "/kelola/admin/moderasi",
    );
  });

  it("hides the content through the dialog and says so in the status line", async () => {
    sessionStorage.setItem("rm-roles", "administrator");
    open();
    fireEvent.click(await screen.findByRole("button", { name: "Sembunyikan" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Sembunyikan" }));
    expect(within(dialog).getByText("Tulis alasannya. Alasan tercatat di log.")).toBeTruthy();
    fireEvent.change(within(dialog).getByLabelText("Alasan"), { target: { value: "Spam" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Sembunyikan" }));
    expect(await screen.findByText("Sembunyikan: selesai.")).toBeTruthy();
    await waitFor(() => expect(screen.getByRole("button", { name: "Pulihkan" })).toBeTruthy());
    expect(screen.queryByRole("button", { name: "Abaikan laporan" })).toBeNull();
  });

  it("refuses a decision from someone who is not a platform admin", async () => {
    sessionStorage.setItem("rm-roles", "editor");
    open();
    fireEvent.click(await screen.findByRole("button", { name: "Abaikan laporan" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Abaikan laporan" }));
    expect(await screen.findByText(/Hanya Administrator dan Super Admin/)).toBeTruthy();
    expect(moderation.read()).toEqual([]);
  });

  it("offers nothing but the author once deleted", async () => {
    moderation.write([
      { kind: "post", targetId: "toples-kerupuk", decision: "hapus", by: "m", at: Date.now() },
    ]);
    open();
    expect(await screen.findByRole("button", { name: "Tangguhkan penulis" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Pulihkan" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Sembunyikan" })).toBeNull();
  });

  it("shows hidden content to the moderator", async () => {
    moderation.write([
      { kind: "post", targetId: "toples-kerupuk", decision: "sembunyikan", by: "m", at: 1 },
    ]);
    open();
    expect(await screen.findByText(/Disembunyikan · /)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Buka dalam konteks" })).toBeTruthy();
  });
});

describe("the audit log", () => {
  it("is empty at first and has nothing that changes an entry", () => {
    render(<AuditView />);
    expect(screen.getByText("Belum ada catatan.")).toBeTruthy();
    expect(screen.getByText(/hanya bisa dibaca/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /hapus|ubah/i })).toBeNull();
  });

  it("lists newest first, reads the reopening from the judging log, and narrows by kind", () => {
    auditLog.write([
      {
        id: "1",
        at: 100,
        actorId: "rinjani-putri",
        action: "role.grant",
        targetId: "laras",
        role: "editor",
      },
      {
        id: "2",
        at: 300,
        actorId: "rinjani-putri",
        action: "content.hide",
        targetId: "laras",
        ref: "post:x",
        reason: "Spam",
      },
    ]);
    judgingLog.write([
      { slug: "lomba-x", state: "ditutup", at: 150 },
      { slug: "lomba-x", state: "dibuka", at: 200, note: "Skor salah", by: "rinjani-putri" },
      { slug: "lomba-y", state: "dibuka", at: 250 },
    ]);
    render(<AuditView />);
    const items = within(screen.getByRole("list", { name: "Catatan" })).getAllByRole("listitem");
    expect(items.map((li) => li.textContent)).toEqual([
      expect.stringContaining("menyembunyikan tulisan Laras"),
      expect.stringContaining("Rinjani Putri (kamu) membuka kembali penilaian lomba lomba-x"),
      expect.stringContaining("memberi role Editor kepada Laras"),
    ]);
    expect(items[1].textContent).toContain("Skor salah");
    fireEvent.click(screen.getByRole("button", { name: "Moderasi" }));
    expect(
      within(screen.getByRole("list", { name: "Catatan" })).getAllByRole("listitem"),
    ).toHaveLength(1);
    expect(window.location.search).toBe("?jenis=moderasi");
  });

  it("pages the log 25 at a time", () => {
    auditLog.write(
      Array.from({ length: 30 }, (_, i) => ({
        id: `e${i}`,
        at: i + 1,
        actorId: "rinjani-putri",
        action: "role.grant" as const,
        targetId: "laras",
        role: "editor",
      })),
    );
    render(<AuditView />);
    expect(
      within(screen.getByRole("list", { name: "Catatan" })).getAllByRole("listitem"),
    ).toHaveLength(25);
    fireEvent.click(screen.getByRole("button", { name: "Muat lebih banyak" }));
    expect(
      within(screen.getByRole("list", { name: "Catatan" })).getAllByRole("listitem"),
    ).toHaveLength(30);
  });
});
