import { beforeEach, describe, expect, it } from "vitest";
import { deleteTestimonial, saveTestimonial } from "@/features/projects/kelas/testimonial-actions";
import { createMemoryAssignmentStore } from "@/features/projects/kelas/storage/memory-assignment-store";
import { testimonials } from "@/features/projects/kelas/testimonial-store";
import { register } from "../components/submit-helpers";
import { CERPEN, handedIn, PUISI } from "./helpers";

const NOW = Date.now();
const input = (over = {}) => ({
  slug: CERPEN,
  text: "Kelasnya membantu.",
  showName: false,
  ...over,
});

async function storeWith(status: "selesai" | "dikumpulkan") {
  const store = createMemoryAssignmentStore();
  await store.add(handedIn({ status }));
  return store;
}

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  testimonials.reset();
});

describe("writing a testimonial", () => {
  it("saves one for a participant whose task is marked Selesai, name hidden by default", async () => {
    register(CERPEN);
    const result = await saveTestimonial(input(), NOW, await storeWith("selesai"));
    expect(result).toMatchObject({ ok: true, message: "Testimoni terkirim." });
    expect(testimonials.read()).toHaveLength(1);
    expect(testimonials.read()[0]).toMatchObject({
      slug: CERPEN,
      showName: false,
      text: "Kelasnya membantu.",
    });
  });

  it("changes the one already written instead of adding another", async () => {
    register(CERPEN);
    const store = await storeWith("selesai");
    await saveTestimonial(input(), NOW, store);
    const result = await saveTestimonial(
      input({ text: "Lebih baik lagi.", showName: true }),
      NOW + 5,
      store,
    );
    expect(result.message).toBe("Testimoni diperbarui.");
    expect(testimonials.read()).toHaveLength(1);
    expect(testimonials.read()[0]).toMatchObject({
      text: "Lebih baik lagi.",
      showName: true,
      updatedAt: NOW + 5,
    });
  });

  it.each([
    ["is not registered", async () => createMemoryAssignmentStore(), "belum terdaftar"],
    ["has no task marked Selesai", async () => storeWith("dikumpulkan"), "dinilai Selesai"],
  ])("refuses when the reader %s", async (_name, makeStore, expected) => {
    if (_name !== "is not registered") register(CERPEN);
    const result = await saveTestimonial(input(), NOW, await makeStore());
    expect(result.ok).toBe(false);
    expect(result.message).toContain(expected);
    expect(testimonials.read()).toHaveLength(0);
  });

  it("refuses before the class has started", async () => {
    register(PUISI);
    const store = createMemoryAssignmentStore();
    await store.add(handedIn({ slug: PUISI, status: "selesai" }));
    const result = await saveTestimonial(input({ slug: PUISI }), NOW, store);
    expect(result.message).toContain("setelah kelas dimulai");
  });

  it("refuses an empty text and a text that is too long", async () => {
    register(CERPEN);
    const store = await storeWith("selesai");
    expect((await saveTestimonial(input({ text: " " }), NOW, store)).message).toContain("Tulis");
    expect((await saveTestimonial(input({ text: "a".repeat(301) }), NOW, store)).message).toContain(
      "300",
    );
    expect(testimonials.read()).toHaveLength(0);
  });

  it("refuses a guest", async () => {
    register(CERPEN);
    sessionStorage.setItem("rm-viewer", "tamu");
    const result = await saveTestimonial(input(), NOW, await storeWith("selesai"));
    expect(result).toMatchObject({ ok: false, message: "Masuk dulu untuk menulis testimoni." });
  });

  it("refuses a project that is not a class", async () => {
    register("lomba-puisi-pendek-nusantara");
    const result = await saveTestimonial(
      input({ slug: "lomba-puisi-pendek-nusantara" }),
      NOW,
      createMemoryAssignmentStore(),
    );
    expect(result.ok).toBe(false);
  });
});

describe("deleting a testimonial", () => {
  it("removes the reader's own and says when it is already gone", async () => {
    register(CERPEN);
    await saveTestimonial(input(), NOW, await storeWith("selesai"));
    expect(deleteTestimonial(CERPEN).ok).toBe(true);
    expect(testimonials.read()).toHaveLength(0);
    expect(deleteTestimonial(CERPEN).ok).toBe(false);
  });
});
