import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(window.location.search),
  usePathname: () => "/studio/abc",
  useRouter: () => ({ push: vi.fn() }),
}));

import { BugReportDetailView } from "@/features/kelola/admin/components/bug-report-detail-view";
import { BugReportsView } from "@/features/kelola/admin/components/bug-reports-view";
import { setBugStatus } from "@/features/kelola/admin/reports/bug-report-actions";
import { auditLog } from "@/features/kelola/audit/audit-log";
import { auditSentence } from "@/features/kelola/audit/audit-text";
import { ReportProblemDialog } from "@/features/support/components/report-problem-dialog";
import { bugReportLog, bugReports } from "@/features/support/bug-report-store";
import { submitBugReport } from "@/features/support/submit-bug-report";
import { installDialogShim } from "@/test/dialog-shim";

installDialogShim();

const as = (roles: string) => sessionStorage.setItem("rm-roles", roles);
const context = { path: "/x", language: "id", theme: "light", screen: "1 × 1", browser: "Chrome" };

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  bugReports.reset();
  bugReportLog.reset();
  auditLog.reset();
  window.history.replaceState(null, "", "/kelola/admin/laporan");
});
afterEach(cleanup);

describe("submitBugReport", () => {
  it("stores a report for the signed-in account, trimmed, with the info only when given", () => {
    const sent = submitBugReport(
      { category: "display", description: "  Tombol terpotong  ", steps: "", context },
      "me",
      10,
    );
    expect(sent.ok).toBe(true);
    expect(bugReports.read()).toEqual([
      {
        id: "bug-10-0",
        category: "display",
        description: "Tombol terpotong",
        context,
        reporterId: "me",
        at: 10,
      },
    ]);
    submitBugReport(
      { category: "other", description: "Lain", steps: "Buka", context: null },
      "me",
      11,
    );
    const second = bugReports.read()[1];
    expect(second.context).toBeUndefined();
    expect(second.steps).toBe("Buka");
  });

  it("writes nothing when the text is not acceptable", () => {
    const sent = submitBugReport({ category: "", description: "", steps: "", context: null });
    expect(sent).toEqual({
      ok: false,
      problems: { category: "categoryRequired", description: "descriptionEmpty" },
    });
    expect(bugReports.read()).toHaveLength(0);
  });
});

describe("report dialog", () => {
  it("keeps the dialog and the text when something is missing, and focuses the first problem", () => {
    render(<ReportProblemDialog onClose={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Kirim laporan" }));
    expect(screen.getByText("Pilih jenis masalah.", { selector: "span" })).toBeTruthy();
    expect(screen.getByText("Ceritakan masalahnya.")).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText("Jenis masalah"));
    expect(bugReports.read()).toHaveLength(0);
  });

  it("sends the report with the page address and says it was received", () => {
    render(<ReportProblemDialog onClose={() => {}} />);
    fireEvent.change(screen.getByLabelText("Jenis masalah"), { target: { value: "save" } });
    fireEvent.change(screen.getByLabelText("Apa yang terjadi?"), {
      target: { value: "Judul hilang setelah muat ulang" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Kirim laporan" }));
    const [stored] = bugReports.read();
    expect(stored.category).toBe("save");
    expect(stored.context?.path).toBe("/studio/abc");
    expect(screen.getByRole("status").textContent).toMatch(/Terima kasih/);
    expect(document.activeElement).toBe(screen.getByRole("status"));
  });

  it("leaves the technical info out when the box is cleared", () => {
    render(<ReportProblemDialog onClose={() => {}} />);
    expect(screen.getByLabelText("Info teknis yang ikut terkirim")).toBeTruthy();
    fireEvent.click(screen.getByRole("checkbox", { name: /Sertakan info teknis/ }));
    expect(screen.queryByLabelText("Info teknis yang ikut terkirim")).toBeNull();
    fireEvent.change(screen.getByLabelText("Jenis masalah"), { target: { value: "other" } });
    fireEvent.change(screen.getByLabelText("Apa yang terjadi?"), { target: { value: "Aneh" } });
    fireEvent.click(screen.getByRole("button", { name: "Kirim laporan" }));
    expect(bugReports.read()[0].context).toBeUndefined();
  });
});

const seed = () =>
  bugReports.write([
    { id: "r1", category: "save", description: "Tidak tersimpan", reporterId: "nur-aisyah", at: 1 },
    { id: "r2", category: "display", description: "Tampilan rusak", reporterId: "laras", at: 2 },
  ]);

describe("setBugStatus", () => {
  beforeEach(seed);

  it("refuses anyone who is not an Administrator or Super Admin, and writes nothing", () => {
    as("editor");
    expect(setBugStatus("r1", "selesai").code).toBe("notAllowed");
    expect(bugReportLog.read()).toHaveLength(0);
    expect(auditLog.read()).toHaveLength(0);
  });

  it("moves a report forward, logs it, and refuses a step that no longer applies", () => {
    as("administrator");
    expect(setBugStatus("r1", "diproses", "Sedang dicek").ok).toBe(true);
    expect(setBugStatus("r1", "selesai").ok).toBe(true);
    expect(setBugStatus("r1", "diproses").code).toBe("unavailable");
    expect(setBugStatus("hilang", "selesai").code).toBe("gone");
    expect(bugReportLog.read().map((e) => e.status)).toEqual(["diproses", "selesai"]);
    const [first, second] = auditLog.read();
    expect(first).toMatchObject({
      action: "bugreport.progress",
      ref: "bug:r1",
      reason: "Sedang dicek",
    });
    expect(auditSentence(second)).toMatch(/laporan masalah “Tidak tersimpan” sebagai selesai/);
  });

  it("refuses a note that is too long", () => {
    as("administrator");
    expect(setBugStatus("r1", "selesai", "a".repeat(1001)).code).toBe("noteTooLong");
    expect(bugReportLog.read()).toHaveLength(0);
  });
});

describe("admin screens", () => {
  beforeEach(seed);

  it("lists new reports first, shows who sent them, and narrows by status", () => {
    render(<BugReportsView />);
    const list = screen.getByRole("list", { name: "Laporan masalah" });
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0].textContent).toMatch(/Tampilan rusak/);
    expect(items[0].textContent).toMatch(/Laras/);
    fireEvent.click(screen.getByRole("button", { name: /^Selesai/ }));
    expect(screen.getByText("Belum ada laporan yang selesai.")).toBeTruthy();
    expect(window.location.search).toBe("?status=selesai");
  });

  it("finishes a report from its page and says so", () => {
    as("administrator");
    render(<BugReportDetailView reportId="r1" />);
    fireEvent.click(screen.getByRole("button", { name: "Tandai selesai" }));
    const dialog = within(screen.getByRole("dialog"));
    fireEvent.click(dialog.getByRole("button", { name: "Tandai selesai" }));
    expect(screen.getByText("Laporan ditandai selesai.")).toBeTruthy();
    expect(screen.getByText("Laporan ini sudah selesai.")).toBeTruthy();
    expect(bugReportLog.read()).toHaveLength(1);
  });

  it("says so when the report is gone", () => {
    render(<BugReportDetailView reportId="hilang" />);
    expect(screen.getByText("Laporan ini tidak ditemukan.")).toBeTruthy();
  });
});
