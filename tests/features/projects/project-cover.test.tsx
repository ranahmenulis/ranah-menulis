import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const files = vi.hoisted(() => ({
  current: null as null | import("@/lib/files/file-store").FileStore,
}));
vi.mock("@/lib/files/store", () => ({ fileStore: () => files.current }));

import { ProjectCover } from "@/features/projects/components/project-cover";
import { createMemoryFileStore } from "@/lib/files/memory-file-store";

const BASE = { slug: "antologi-hujan", category: "antologi" as const, title: "Antologi Hujan" };
const POSTER = { fileId: "p1", alt: "Poster Antologi Hujan, pendaftaran dibuka" };

beforeEach(() => {
  files.current = createMemoryFileStore();
  URL.createObjectURL = vi.fn(() => "blob:poster");
  URL.revokeObjectURL = vi.fn();
});
afterEach(cleanup);

const keep = (id: string) =>
  files.current!.put({
    id,
    name: "poster.webp",
    type: "image/webp",
    size: 4,
    blob: new Blob(["webp"], { type: "image/webp" }),
    createdAt: 1,
  });

describe("ProjectCover", () => {
  it("draws the generated cover when the project has no poster", () => {
    const { container } = render(<ProjectCover project={BASE} />);
    expect(container.querySelector("[data-cover='antologi']")).not.toBeNull();
    expect(container.querySelector("img")).toBeNull();
  });

  it("shows the uploaded poster instead, as decoration by default", async () => {
    await keep("p1");
    const { container } = render(<ProjectCover project={{ ...BASE, poster: POSTER }} />);
    await waitFor(() => expect(container.querySelector("img")).not.toBeNull());
    const frame = container.querySelector("[data-cover='poster']");
    expect(frame?.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelector("img")?.getAttribute("alt")).toBe("");
    expect(container.querySelector("[data-cover='antologi']")).toBeNull();
  });

  it("reads the description aloud where the poster is the content", async () => {
    await keep("p1");
    render(<ProjectCover project={{ ...BASE, poster: POSTER }} describe />);
    const image = await screen.findByAltText(POSTER.alt);
    expect(image.getAttribute("src")).toBe("blob:poster");
  });

  it("falls back to the generated cover when the file is gone from this device", async () => {
    const { container } = render(<ProjectCover project={{ ...BASE, poster: POSTER }} />);
    await waitFor(() => expect(container.querySelector("[data-cover='antologi']")).not.toBeNull());
    expect(container.querySelector("img")).toBeNull();
  });
});
