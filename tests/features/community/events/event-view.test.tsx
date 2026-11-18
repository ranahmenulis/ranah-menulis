import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EventView } from "@/features/community/events/components/event-view";
import { EventsView } from "@/features/community/events/components/events-view";
import { refreshEvents } from "@/features/community/events/event-store";
import { COASTAL_GROUP_ID } from "@/features/community/groups/group-model";
import { groupSeeds, writingGroups } from "@/features/community/groups/group-store";
import { ME_ID } from "@/features/kelola/identity";
import type { DocumentStore } from "@/features/studio/storage/document-store";
import { installDialogShim } from "@/test/dialog-shim";
import { setViewer } from "@/lib/viewer";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/event/cerita-selama-sepekan",
  useSearchParams: () => new URLSearchParams(),
}));

const stored = {
  id: "doc-event",
  title: "Surat Rahasia",
  content: {},
  version: 1,
  wordCount: 3,
  updatedAt: 1,
};
const store = { get: async () => stored, list: async () => [stored] } as unknown as DocumentStore;
const eventId = "cerita-selama-sepekan";

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  writingGroups.reset();
  installDialogShim();
  vi.spyOn(Date, "now").mockReturnValue(Date.parse("2026-11-18T12:00:00+07:00"));
});
afterEach(() => {
  cleanup();
  writingGroups.reset();
  vi.restoreAllMocks();
});

describe("public event screens", () => {
  it("updates participant names on current membership changes without changing the public count", async () => {
    render(<EventView id={eventId} store={store} />);
    expect(await screen.findByText("Hafiz Rahman")).toBeTruthy();
    expect(screen.queryByText("Maya Anindita")).toBeNull();
    await act(async () =>
      writingGroups.write(
        groupSeeds.map((group) =>
          group.id === COASTAL_GROUP_ID
            ? { ...group, members: group.members.filter(({ authorId }) => authorId !== ME_ID) }
            : group,
        ),
      ),
    );
    await waitFor(() => expect(screen.queryByText("Hafiz Rahman")).toBeNull());
    expect(screen.getByText(/2 peserta/)).toBeTruthy();
    await act(async () => setViewer("tamu"));
    expect(await screen.findByRole("link", { name: "Masuk untuk bergabung" })).toBeTruthy();
  });

  it("announces leaving after the trigger disappears and keeps private document data out of the detail", async () => {
    render(<EventView id={eventId} store={store} />);
    fireEvent.click(await screen.findByRole("button", { name: "Gabung" }));
    const join = within(screen.getByRole("dialog", { name: "Gabung event" }));
    fireEvent.change(await join.findByLabelText("Dokumen Studio"), {
      target: { value: stored.id },
    });
    fireEvent.click(join.getByRole("button", { name: "Gabung" }));
    const joinedStatus = await screen.findByText("Kamu bergabung dengan event.");
    await waitFor(() => expect(document.activeElement).toBe(joinedStatus));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByText(stored.title)).toBeNull();
    expect(screen.getByText(/3 peserta/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Keluar dari event" }));
    fireEvent.click(
      within(screen.getByRole("alertdialog")).getByRole("button", { name: "Keluar" }),
    );
    const leftStatus = await screen.findByText("Kamu keluar dari event.");
    await waitFor(() => expect(document.activeElement).toBe(leftStatus));
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(screen.getByText(/2 peserta/)).toBeTruthy();
  });

  it("offers a retry for unreadable data and a way home from an empty list", async () => {
    localStorage.setItem("ranah.events", "{");
    render(<EventsView />);
    expect(await screen.findByRole("alert")).toBeTruthy();
    localStorage.setItem("ranah.events", "[]");
    fireEvent.click(screen.getByRole("button", { name: "Coba lagi" }));
    expect(await screen.findByRole("link", { name: "Kembali ke Beranda" })).toBeTruthy();
    act(() => {
      localStorage.removeItem("ranah.events");
      refreshEvents();
    });
    expect(await screen.findByRole("link", { name: /Cerita Selama Sepekan/ })).toBeTruthy();
  });
});
