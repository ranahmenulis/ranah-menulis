import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/files/compress-image", () => ({
  compressImage: vi.fn(async () => ({
    blob: new Blob(["webp"], { type: "image/webp" }),
    dataUrl: "data:image/webp;base64,AA==",
    width: 800,
    height: 1000,
  })),
}));

import { OWNER_ID } from "@/features/kelola/organizer/organizer-access";
import { discardImage, storeImage } from "@/lib/files/store-image";
import { buildProject } from "@/features/kelola/organizer/project-build";
import { emptyInput, inputOf, type ProjectInput } from "@/features/kelola/organizer/project-input";
import { isStoredProject } from "@/features/projects/stored-projects";
import { createMemoryFileStore } from "@/lib/files/memory-file-store";

const NOW = Date.now();
const day = (n: number) => new Date(NOW + n * 86_400_000).toISOString().slice(0, 10);

const input = (patch: Partial<ProjectInput> = {}): ProjectInput => ({
  ...emptyInput("antologi"),
  title: "Antologi Hujan",
  summary: "Cerita.",
  about: "Isi.",
  requirements: "Syarat.",
  closesDate: day(20),
  minWords: "500",
  maxWords: "2000",
  theme: "Hujan",
  stages: "Satu",
  ...patch,
});

const build = (patch: Partial<ProjectInput> = {}, existing?: Parameters<typeof inputOf>[0]) =>
  buildProject(input(patch), { now: NOW, taken: 0, slugs: [], ownerId: OWNER_ID, existing });

// Bytes of a real PNG header: the type is read from the bytes, never from the name.
const PNG = () =>
  new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])], "p.png");

beforeEach(() => localStorage.clear());

describe("poster in the project form", () => {
  it("is optional: a project without one builds and carries no poster", () => {
    const built = build();
    expect(built.ok && built.project.poster).toBeUndefined();
  });

  it("keeps the file id and a trimmed description", () => {
    const built = build({ posterId: "f1", posterAlt: "  Poster lomba menulis  " });
    expect(built.ok && built.project.poster).toEqual({ fileId: "f1", alt: "Poster lomba menulis" });
  });

  it("names the missing description and keeps everything else", () => {
    const built = build({ posterId: "f1", posterAlt: "   " });
    expect(built.ok).toBe(false);
    if (!built.ok) expect(built.errors.posterAlt).toMatch(/teks alternatif/i);
  });

  it("refuses a description over 200 characters", () => {
    const built = build({ posterId: "f1", posterAlt: "a".repeat(201) });
    expect(built.ok).toBe(false);
    if (!built.ok) expect(built.errors.posterAlt).toMatch(/200/);
  });

  it("starts editing from the saved poster and can drop it", () => {
    const first = build({ posterId: "f1", posterAlt: "Poster" });
    if (!first.ok) throw new Error("setup");
    const again = inputOf(first.project);
    expect(again).toMatchObject({ posterId: "f1", posterAlt: "Poster" });

    const removed = build({ ...again, posterId: "", posterAlt: "" }, first.project);
    expect(removed.ok && removed.project.poster).toBeUndefined();
  });

  it("is accepted by the guard for stored projects, and a half poster is not", () => {
    const built = build({ posterId: "f1", posterAlt: "Poster" });
    if (!built.ok) throw new Error("setup");
    expect(isStoredProject(JSON.parse(JSON.stringify(built.project)))).toBe(true);
    expect(isStoredProject({ ...built.project, poster: { fileId: 5 } })).toBe(false);
  });
});

describe("storeImage and discardImage", () => {
  it("keeps a real image as WebP and returns its id", async () => {
    const files = createMemoryFileStore();
    const saved = await storeImage(PNG(), files, 100);
    expect(saved.ok).toBe(true);
    if (!saved.ok) return;
    const stored = await files.get(saved.id);
    expect(stored).toMatchObject({ type: "image/webp", createdAt: 100 });
  });

  it("refuses something that is not an image and stores nothing", async () => {
    const files = createMemoryFileStore();
    const put = vi.spyOn(files, "put");
    const saved = await storeImage(new File(["%PDF-1.7 x"], "naskah.png"), files);
    expect(saved).toEqual({
      ok: false,
      message: expect.stringMatching(/JPG, PNG, atau WebP/),
      problem: "type",
    });
    expect(put).not.toHaveBeenCalled();
  });

  it("frees a file, and a failing store only leaves it behind", async () => {
    const files = createMemoryFileStore();
    const saved = await storeImage(PNG(), files);
    if (!saved.ok) throw new Error("setup");
    await discardImage(saved.id, files);
    expect(await files.get(saved.id)).toBeNull();

    const broken = { ...files, delete: vi.fn().mockRejectedValue(new Error("x")) };
    await expect(discardImage("f1", broken)).resolves.toBeUndefined();
    await expect(discardImage("", broken)).resolves.toBeUndefined();
  });
});
