import {
  act,
  cleanup,
  configure,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { editorPicks } from "@/features/community/curation/picks-store";
import { moderation } from "@/features/community/moderation/report-store";
import { createMemoryPostStore } from "@/features/community/storage/memory-store";
import { SEED_ASSIGNMENTS, staffAssignments } from "@/features/kelola/staff-assignments";
import { NotificationsView } from "@/features/notifications/notifications-view";
import { useUnreadCount } from "@/features/notifications/use-notifications";
import { createMemoryAssignmentStore } from "@/features/projects/kelas/storage/memory-assignment-store";
import { createMemorySoloStore } from "@/features/projects/solo/storage/memory-solo-store";
import { createMemorySubmissionStore } from "@/features/projects/storage/memory-submission-store";
import { submission } from "../projects/helpers";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
configure({ asyncUtilTimeout: 5000 });

const WORK = submission({
  slug: "antologi-surat-yang-tidak-pernah-terkirim",
  title: "Surat Bulan Juli",
});
const POST = "hujan-pertama-bulan-november";
const staffLink = () => screen.findByRole("link", { name: /ditugaskan kepadamu/ });

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  push.mockClear();
});
afterEach(cleanup);

function stores() {
  return {
    store: createMemorySubmissionStore(),
    tasks: createMemoryAssignmentStore(),
    solo: createMemorySoloStore(),
    posts: createMemoryPostStore(),
  };
}

function BellCount({ store, tasks, solo, posts }: ReturnType<typeof stores>) {
  return <span aria-label="Bell unread">{useUnreadCount(store, tasks, solo, posts)}</span>;
}

describe("management inbox", () => {
  it("drops a revoked assignment's title, link and unread count, moving focus to the status", async () => {
    sessionStorage.setItem("rm-roles", "editor");
    const data = stores();
    await data.store.add(WORK, 5);
    render(
      <>
        <NotificationsView {...data} />
        <BellCount {...data} />
      </>,
    );
    const link = await staffLink();
    expect(link.getAttribute("href")).toBe(`/kelola/editor/${WORK.id}`);
    expect(screen.getByLabelText("Bell unread").textContent).toBe("5");
    link.focus();

    act(() => staffAssignments.write(SEED_ASSIGNMENTS.filter((item) => item.role !== "editor")));

    expect(screen.queryByRole("link", { name: /ditugaskan kepadamu/ })).toBeNull();
    expect(screen.getByLabelText("Bell unread").textContent).toBe("4");
    expect(document.activeElement).toBe(screen.getByRole("status"));
  });

  it("opens an allowed staff notification and remembers it as read", async () => {
    sessionStorage.setItem("rm-roles", "editor");
    const data = stores();
    await data.store.add(WORK, 5);
    render(<NotificationsView {...data} />);
    const link = await staffLink();
    vi.spyOn(link, "getClientRects").mockReturnValue({ length: 1 } as DOMRectList);
    fireEvent.click(link);
    await waitFor(() => expect(push).toHaveBeenCalledWith(`/kelola/editor/${WORK.id}`));
    expect(JSON.parse(localStorage.getItem("ranah.notificationsRead") ?? "[]")).toEqual([
      `staff-editor:${WORK.id}:initial`,
    ]);
  });

  it("rejects a stale link when the work was withdrawn since the list was drawn", async () => {
    sessionStorage.setItem("rm-roles", "editor");
    const data = stores();
    await data.store.add(WORK, 5);
    render(<NotificationsView {...data} />);
    const link = await staffLink();
    vi.spyOn(link, "getClientRects").mockReturnValue({ length: 1 } as DOMRectList);
    await data.store.update(WORK.id, (work) => ({ ...work, status: "ditarik" }));
    fireEvent.click(link);
    expect(await screen.findByText(/Notifikasi ini sudah tidak tersedia/)).toBeTruthy();
    expect(push).not.toHaveBeenCalled();
    expect(localStorage.getItem("ranah.notificationsRead")).toBeNull();
    await waitFor(() =>
      expect(screen.queryByRole("link", { name: /ditugaskan kepadamu/ })).toBeNull(),
    );
  });

  it("removes fixture and curated links immediately when moderation hides their post", async () => {
    const data = stores();
    editorPicks.write([{ postId: POST, at: 12 }]);
    render(<NotificationsView {...data} />);
    expect(await screen.findByRole("link", { name: /dipilih untuk Editor/ })).toBeTruthy();
    act(() =>
      moderation.write([
        { kind: "post", targetId: POST, by: "admin", decision: "sembunyikan", at: 15 },
      ]),
    );
    expect(screen.queryByRole("link", { name: /Hujan Pertama Bulan November/ })).toBeNull();
    const button = await screen.findByRole("button", { name: /Tulisanmu disembunyikan/ });
    fireEvent.click(button);
    expect(JSON.parse(localStorage.getItem("ranah.notificationsRead") ?? "[]")).toEqual([
      `mod-hidden:post:${POST}:15`,
    ]);
  });

  it("keeps healthy sources visible and retries a failed source", async () => {
    sessionStorage.setItem("rm-roles", "editor");
    const data = stores();
    await data.store.add(WORK, 5);
    const list = data.store.list;
    vi.spyOn(data.store, "list")
      .mockRejectedValueOnce(new Error("Storage unavailable"))
      .mockImplementation(list);
    render(<NotificationsView {...data} />);
    const retry = await screen.findByRole("button", { name: "Coba lagi" });
    expect(
      screen.getByRole("link", { name: /membalas komentarmu di “Hujan Pertama/ }),
    ).toBeTruthy();
    fireEvent.click(retry);
    expect(await staffLink()).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
