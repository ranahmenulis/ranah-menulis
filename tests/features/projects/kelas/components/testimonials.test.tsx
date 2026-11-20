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

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

import { ClassDashboard } from "@/features/projects/kelas/components/class-dashboard";
import { ClassTestimonials } from "@/features/projects/kelas/components/class-testimonials";
import { createMemoryAssignmentStore } from "@/features/projects/kelas/storage/memory-assignment-store";
import { testimonials, testimonialDecisions } from "@/features/projects/kelas/testimonial-store";
import { installDialogShim } from "@/test/dialog-shim";
import { register } from "../../components/submit-helpers";
import { CERPEN, handedIn, PUISI } from "../helpers";

configure({ asyncUtilTimeout: 5000 });
installDialogShim();

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  testimonials.reset();
  testimonialDecisions.reset();
});
afterEach(cleanup);

async function dashboard(status?: "selesai" | "dikumpulkan") {
  const store = createMemoryAssignmentStore();
  if (status) await store.add(handedIn({ status }));
  render(<ClassDashboard slug={CERPEN} store={store} />);
  return (await screen.findByRole("heading", { name: "Testimoni" })).closest("section")!;
}

describe("testimonials on the class page", () => {
  it("shows the examples, with a name only when the writer agreed", () => {
    render(<ClassTestimonials slug={CERPEN} />);
    expect(screen.getByText(/Kerangka tiga babak/)).toBeTruthy();
    expect(screen.getByText("Nadia Rahmawati")).toBeTruthy();
    expect(screen.getByText("Peserta kelas")).toBeTruthy();
    expect(screen.queryByText("Contoh Peserta")).toBeNull();
  });

  it("is not drawn when a class has none, or when all of them are hidden", () => {
    const { container, rerender } = render(<ClassTestimonials slug={PUISI} />);
    expect(container.textContent).toBe("");
    testimonialDecisions.write(
      ["contoh-cerpen-1", "contoh-cerpen-2"].map((id) => ({
        testimonialId: id,
        state: "disembunyikan" as const,
        at: 1,
        by: "x",
      })),
    );
    rerender(<ClassTestimonials slug={CERPEN} />);
    expect(container.textContent).toBe("");
  });
});

describe("writing one on the dashboard", () => {
  beforeEach(() => register(CERPEN));

  it("says what is needed first when no task is marked Selesai", async () => {
    const section = await dashboard("dikumpulkan");
    expect(within(section).getByText(/dinilai Selesai oleh mentor/)).toBeTruthy();
    expect(within(section).queryByRole("button", { name: "Kirim testimoni" })).toBeNull();
  });

  it("offers a form whose name choice starts unticked, and shows the result", async () => {
    const section = await dashboard("selesai");
    const choice = within(section).getByRole("checkbox", {
      name: /Tampilkan nama saya/,
    }) as HTMLInputElement;
    expect(choice.checked).toBe(false);
    fireEvent.change(within(section).getByLabelText("Testimonimu"), {
      target: { value: "Sangat membantu." },
    });
    fireEvent.click(within(section).getByRole("button", { name: "Kirim testimoni" }));
    await waitFor(() => expect(testimonials.read()).toHaveLength(1));
    expect(await within(section).findByText("Testimoni terkirim.")).toBeTruthy();
    expect(within(section).getByText("Sangat membantu.")).toBeTruthy();
    expect(within(section).getByText(/sebagai Peserta kelas/)).toBeTruthy();
  });

  it("keeps what was typed and says why when the text is empty", async () => {
    const section = await dashboard("selesai");
    fireEvent.click(within(section).getByRole("button", { name: "Kirim testimoni" }));
    expect(await within(section).findByText("Tulis testimonimu dulu.")).toBeTruthy();
    expect(testimonials.read()).toHaveLength(0);
  });

  it("lets the writer change and delete it, and tells them when a curator hid it", async () => {
    const section = await dashboard("selesai");
    fireEvent.change(within(section).getByLabelText("Testimonimu"), {
      target: { value: "Pertama." },
    });
    fireEvent.click(within(section).getByRole("button", { name: "Kirim testimoni" }));
    fireEvent.click(await within(section).findByRole("button", { name: "Ubah testimoni" }));
    fireEvent.change(within(section).getByLabelText("Testimonimu"), {
      target: { value: "Kedua." },
    });
    fireEvent.click(within(section).getByRole("button", { name: "Simpan perubahan" }));
    expect(await within(section).findByText("Kedua.")).toBeTruthy();

    testimonialDecisions.write([
      {
        testimonialId: testimonials.read()[0]!.id,
        state: "disembunyikan",
        at: 1,
        by: "x",
        reason: "rahasia",
      },
    ]);
    expect(await within(section).findByText(/Disembunyikan oleh pengelola kelas/)).toBeTruthy();
    expect(within(section).queryByText(/rahasia/)).toBeNull();

    fireEvent.click(within(section).getByRole("button", { name: "Hapus testimoni" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Hapus testimoni" }));
    await waitFor(() => expect(testimonials.read()).toHaveLength(0));
    expect((await within(section).findByRole("status")).textContent).toBe("Testimoni dihapus.");
  });
});
