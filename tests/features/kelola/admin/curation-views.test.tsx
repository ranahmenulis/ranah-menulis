import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(window.location.search),
  usePathname: () => "/kelola/admin/kurasi",
  useRouter: () => ({ push: vi.fn() }),
}));

import { CommunityLink } from "@/features/app-shell/community-link";
import { editorPicks } from "@/features/community/curation/picks-store";
import { SEED_PICK_IDS } from "@/features/community/curation/seed-picks";
import { createMemoryPostStore } from "@/features/community/storage/memory-store";
import { CurationView } from "@/features/kelola/admin/curation/curation-view";
import { SettingsView } from "@/features/kelola/admin/settings/settings-view";
import { auditLog } from "@/features/kelola/audit/audit-log";
import { featuredProjects } from "@/features/projects/featured-store";
import { platformSettings } from "@/lib/platform-settings";
import { installDialogShim } from "@/test/dialog-shim";

installDialogShim();

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  editorPicks.reset();
  featuredProjects.reset();
  platformSettings.reset();
  auditLog.reset();
  sessionStorage.setItem("rm-roles", "administrator");
});
afterEach(cleanup);

describe("curation screen", () => {
  it("lists the picks in order and removes one, saying so in the status line", async () => {
    render(<CurationView store={createMemoryPostStore()} />);
    const remove = await screen.findByRole("button", { name: /^Cabut Hujan Pertama/ });
    fireEvent.click(remove);
    await waitFor(() =>
      expect(editorPicks.read().map((p) => p.postId)).not.toContain(SEED_PICK_IDS[0]),
    );
    expect(screen.getByRole("status").textContent).toContain("dicabut");
  });

  it("adds a searched post and logs it", async () => {
    render(<CurationView store={createMemoryPostStore()} />);
    const search = await screen.findByLabelText("Tambah tulisan");
    fireEvent.change(search, { target: { value: "Toples" } });
    fireEvent.click(await screen.findByRole("button", { name: /^Tambahkan Toples Kerupuk/ }));
    await waitFor(() => expect(editorPicks.read().at(-1)?.title).toBe("Toples Kerupuk"));
    expect(auditLog.read()[0].action).toBe("pick.add");
  });

  it("marks a project unggulan", async () => {
    render(<CurationView store={createMemoryPostStore()} />);
    const section = (await screen.findByText("Proyek unggulan", { selector: "h2" })).closest(
      "section",
    )!;
    fireEvent.click(within(section).getAllByRole("button", { name: /^Tandai unggulan/ })[0]);
    await waitFor(() => expect(featuredProjects.read()).toHaveLength(1));
  });
});

describe("settings screen", () => {
  it("keeps the dialog closed and shows one message for a bad address", () => {
    render(<SettingsView />);
    fireEvent.change(screen.getByLabelText("Tautan komunitas"), {
      target: { value: "discord.gg" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Simpan" }));
    expect(screen.getByText(/diawali https:\/\//)).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(platformSettings.read()).toHaveLength(0);
  });

  it("saves through the confirmation, then removes the link the same way", async () => {
    render(<SettingsView />);
    fireEvent.change(screen.getByLabelText("Tautan komunitas"), {
      target: { value: "https://discord.gg/abc" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Simpan" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Simpan" }));
    await waitFor(() => expect(platformSettings.read()).toHaveLength(1));
    fireEvent.click(await screen.findByRole("button", { name: "Hapus tautan" }));
    fireEvent.click(
      within(await screen.findByRole("dialog")).getByRole("button", { name: "Hapus" }),
    );
    await waitFor(() => expect(platformSettings.read()).toHaveLength(0));
    expect(auditLog.read().map((e) => e.action)).toEqual([
      "setting.communityLink.set",
      "setting.communityLink.clear",
    ]);
  });
});

describe("community link for everyone", () => {
  it("draws nothing until set, then opens in a new tab", () => {
    const { container } = render(<CommunityLink variant="row" />);
    expect(container.textContent).toBe("");
    cleanup();
    platformSettings.write([{ communityLink: "https://discord.gg/abc" }]);
    render(<CommunityLink variant="row" />);
    const link = screen.getByRole("link", { name: /Komunitas/ });
    expect(link.getAttribute("href")).toBe("https://discord.gg/abc");
    expect(link.getAttribute("rel")).toContain("noopener");
  });
});
