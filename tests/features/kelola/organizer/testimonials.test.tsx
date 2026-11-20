import {
  cleanup,
  configure,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(window.location.search),
  useRouter: () => ({ push: vi.fn() }),
}));

import { auditLog } from "@/features/kelola/audit/audit-log";
import { auditSentence } from "@/features/kelola/audit/audit-text";
import { ManageView } from "@/features/kelola/organizer/components/manage-view";
import { decideTestimonial } from "@/features/kelola/organizer/testimonial-actions";
import { testimonials, testimonialDecisions } from "@/features/projects/kelas/testimonial-store";
import { createMemorySubmissionStore } from "@/features/projects/storage/memory-submission-store";
import { installDialogShim } from "@/test/dialog-shim";

configure({ asyncUtilTimeout: 5000 });
installDialogShim();

const KELAS = "kelas-cerpen-untuk-pemula";
const SAMPLE = "contoh-cerpen-1";

function open(slug = KELAS) {
  window.history.replaceState(null, "", `/kelola/organizer/${slug}?tab=testimoni`);
  render(<ManageView slug={slug} store={createMemorySubmissionStore()} />);
}

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  testimonials.reset();
  testimonialDecisions.reset();
  auditLog.reset();
  sessionStorage.setItem("rm-roles", "organizer");
});
afterEach(cleanup);

describe("deciding on a testimonial", () => {
  it("hides one with a reason, writes the audit entry, and brings it back", () => {
    const hidden = decideTestimonial(KELAS, SAMPLE, "sembunyikan", "Berisi iklan.", 10);
    expect(hidden.ok).toBe(true);
    expect(testimonialDecisions.read()).toEqual([
      expect.objectContaining({
        testimonialId: SAMPLE,
        state: "disembunyikan",
        reason: "Berisi iklan.",
      }),
    ]);
    const [entry] = auditLog.read();
    expect(entry).toMatchObject({
      action: "testimonial.hide",
      slug: KELAS,
      reason: "Berisi iklan.",
    });
    expect(auditSentence(entry!)).toContain("menyembunyikan testimoni Nadia Rahmawati");

    expect(decideTestimonial(KELAS, SAMPLE, "pulihkan", "", 20).ok).toBe(true);
    expect(auditLog.read().map((e) => e.action)).toEqual([
      "testimonial.hide",
      "testimonial.restore",
    ]);
  });

  it("needs a reason to hide, and refuses a second hide", () => {
    expect(decideTestimonial(KELAS, SAMPLE, "sembunyikan", "  ").ok).toBe(false);
    expect(testimonialDecisions.read()).toHaveLength(0);
    expect(auditLog.read()).toHaveLength(0);
    decideTestimonial(KELAS, SAMPLE, "sembunyikan", "Alasan");
    expect(decideTestimonial(KELAS, SAMPLE, "sembunyikan", "Lagi").message).toContain(
      "sudah disembunyikan",
    );
  });

  it("is refused for a Mentor, for a testimonial that is gone, and for a project that is not a class", () => {
    sessionStorage.setItem("rm-roles", "mentor");
    expect(decideTestimonial(KELAS, SAMPLE, "sembunyikan", "x").ok).toBe(false);
    sessionStorage.setItem("rm-roles", "administrator");
    expect(decideTestimonial(KELAS, "hilang", "sembunyikan", "x").message).toContain("dihapus");
    expect(decideTestimonial("lomba-puisi-pendek-nusantara", SAMPLE, "sembunyikan", "x").ok).toBe(
      false,
    );
    expect(auditLog.read()).toHaveLength(0);
  });
});

describe("Testimoni tab", () => {
  it("is only there for a class", () => {
    open("lomba-puisi-pendek-nusantara");
    expect(screen.queryByRole("link", { name: "Testimoni" })).toBeNull();
  });

  it("lists testimonials, asks for a reason before hiding, and says what happened", async () => {
    open();
    const row = (await screen.findByText(/Kerangka tiga babak/)).closest("li")!;
    expect(within(row).getByText("Tampil di halaman kelas")).toBeTruthy();
    expect(within(row).getByText(/contoh/)).toBeTruthy();

    fireEvent.click(within(row).getByRole("button", { name: "Sembunyikan" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Sembunyikan" }));
    expect(await within(dialog).findByText("Tulis alasan menyembunyikannya.")).toBeTruthy();
    expect(testimonialDecisions.read()).toHaveLength(0);

    fireEvent.change(within(dialog).getByLabelText("Alasan"), {
      target: { value: "Berisi iklan." },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Sembunyikan" }));
    await waitFor(() => expect(testimonialDecisions.read()).toHaveLength(1));
    expect(screen.getByRole("status").textContent).toContain("disembunyikan dari halaman kelas");
    expect(screen.getByText("Alasan: Berisi iklan.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Pulihkan" })).toBeTruthy();
  });
});
