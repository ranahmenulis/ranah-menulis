import { cleanup, configure, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/kelola",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}));

import { KelolaOverview } from "@/features/kelola/components/kelola-overview";
import { createMemorySubmissionStore } from "@/features/projects/storage/memory-submission-store";
import { submission } from "../../projects/helpers";

configure({ asyncUtilTimeout: 5000 });

beforeEach(() => sessionStorage.clear());
afterEach(cleanup);

describe("KelolaOverview", () => {
  it("draws one band per area the viewer holds, each a link with its number of work", async () => {
    sessionStorage.setItem("rm-roles", "editor,organizer");
    const store = createMemorySubmissionStore();
    await store.add(
      submission({
        id: "a",
        docId: "doc-a",
        slug: "antologi-surat-yang-tidak-pernah-terkirim",
        status: "terkirim",
        statusLog: [{ status: "terkirim", at: 1, by: "sistem" }],
      }),
      9,
    );
    const { container } = render(<KelolaOverview submissions={store} />);

    expect(screen.getByRole("heading", { level: 1, name: "Kelola" })).toBeTruthy();
    const links = screen.getAllByRole("link");
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      "/kelola/organizer",
      "/kelola/editor",
    ]);
    expect(container.querySelectorAll("[data-band]")).toHaveLength(2);
    expect(await screen.findByText("karya perlu tindakan")).toBeTruthy();
    await screen.findByText((_, el) => el?.textContent === "1karya perlu tindakan");
  });
});
