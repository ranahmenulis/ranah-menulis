import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ME_ID } from "@/features/kelola/identity";
import { auditLog } from "@/features/kelola/audit/audit-log";
import { suspensions } from "@/features/kelola/admin/role-store";
import { GroupSettingsDialog } from "@/features/community/groups/components/group-dialogs";
import { GroupInvitations } from "@/features/community/groups/components/group-invitations";
import { GroupView } from "@/features/community/groups/components/group-view";
import { GroupsView } from "@/features/community/groups/components/groups-view";
import { removeGroupMember } from "@/features/community/groups/group-actions";
import { COASTAL_GROUP_ID } from "@/features/community/groups/group-model";
import { writingGroups } from "@/features/community/groups/group-store";
import { createMemoryPostStore } from "@/features/community/storage/memory-store";
import { installDialogShim } from "@/test/dialog-shim";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/grup",
  useSearchParams: () => new URLSearchParams(window.location.search),
}));

beforeEach(() => {
  installDialogShim();
  push.mockClear();
  sessionStorage.clear();
  writingGroups.reset();
  auditLog.reset();
  suspensions.reset();
});

afterEach(() => {
  cleanup();
  writingGroups.reset();
  auditLog.reset();
  suspensions.reset();
});

describe("group screens", () => {
  it("submits to the visible group form when the previous route still has a hidden dialog", () => {
    const hiddenSaved = vi.fn();
    const visibleSaved = vi.fn();
    render(
      <>
        <div hidden>
          <GroupSettingsDialog onSaved={hiddenSaved} onClose={vi.fn()} />
        </div>
        <GroupSettingsDialog onSaved={visibleSaved} onClose={vi.fn()} />
      </>,
    );

    const dialog = within(screen.getByRole("dialog", { name: "Buat Lingkar Menulis" }));
    fireEvent.change(dialog.getByLabelText("Nama lingkar"), {
      target: { value: "Ruang yang terlihat" },
    });
    fireEvent.click(dialog.getByRole("button", { name: "Buat lingkar" }));

    expect(visibleSaved).toHaveBeenCalledOnce();
    expect(hiddenSaved).not.toHaveBeenCalled();
    expect(writingGroups.read().at(-1)?.name).toBe("Ruang yang terlihat");
  });

  it("does not suggest signing in again to a suspended writer", () => {
    suspensions.write([{ userId: ME_ID, by: "nur-aisyah", at: 1, reason: "Alasan" }]);
    render(<GroupsView />);

    expect(screen.getByText(/Akun aktif diperlukan/)).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Masuk" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Buat lingkar" })).toBeNull();
  });

  it("validates the code, keeps its input, and closes the dialog before opening the group", async () => {
    render(<GroupsView />);
    fireEvent.click(screen.getByRole("button", { name: "Masukkan kode" }));
    const dialog = screen.getByRole("dialog", { name: "Gabung dengan kode" });
    const code = within(dialog).getByRole("textbox", { name: "Kode undangan" });
    fireEvent.change(code, { target: { value: "kode salah" } });
    fireEvent.submit(code.closest("form")!);
    expect(within(dialog).getByText(/Kode undangan tidak berlaku/)).toBeTruthy();
    expect((code as HTMLInputElement).value).toBe("kode salah");
    fireEvent.change(code, { target: { value: "pesisir26" } });
    fireEvent.submit(code.closest("form")!);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(push).toHaveBeenCalledWith("/grup/penulis-pesisir");
  });

  it("accepts the local invitation and keeps the announcement after the row disappears", () => {
    function InvitationFixture() {
      return <GroupInvitations groups={writingGroups.use()} reader={ME_ID} />;
    }
    render(<InvitationFixture />);
    expect(screen.getByText(/mengundangmu ke Ruang Cerpen/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Terima" }));
    expect(screen.queryByRole("button", { name: "Terima" })).toBeNull();
    expect(screen.getByRole("status").textContent).toBe("Kamu bergabung dengan lingkar.");
    expect(screen.getByRole("link", { name: "Ruang Cerpen" }).getAttribute("href")).toBe(
      "/grup/ruang-cerpen",
    );
  });

  it("removes the private group, its post, and its member names from the open route when access changes", async () => {
    render(<GroupView id={COASTAL_GROUP_ID} posts={createMemoryPostStore()} />);
    const post = await screen.findByRole("link", { name: /Garam dan Pelabuhan/i });
    expect(post.getAttribute("href")).toBe("/postingan/garam-dan-pelabuhan");
    expect(screen.getByText(/Hafiz Rahman · @hafizrahman/)).toBeTruthy();
    act(() => {
      removeGroupMember(COASTAL_GROUP_ID, ME_ID);
    });
    expect(screen.getByText("Lingkar ini tidak tersedia.")).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Grup Penulis Pesisir" })).toBeNull();
    expect(screen.queryByText(/Hafiz Rahman/)).toBeNull();
    expect(screen.queryByRole("link", { name: /Garam dan Pelabuhan/i })).toBeNull();
  });

  it("focuses the outcome if another tab has already hidden the selected post", async () => {
    sessionStorage.setItem("rm-roles", "administrator");
    const postId = "garam-dan-pelabuhan";
    const posts = {
      ...createMemoryPostStore(),
      async getPost() {
        writingGroups.write(
          writingGroups
            .read()
            .map((group) =>
              group.id === COASTAL_GROUP_ID ? { ...group, hiddenPosts: [postId] } : group,
            ),
        );
        return null;
      },
    };
    render(<GroupView id={COASTAL_GROUP_ID} posts={posts} />);
    fireEvent.click(await screen.findByRole("button", { name: "Sembunyikan Garam dan Pelabuhan" }));
    const dialog = within(screen.getByRole("dialog", { name: "Sembunyikan tulisan" }));
    fireEvent.change(dialog.getByRole("textbox", { name: "Alasan" }), {
      target: { value: "Di luar topik" },
    });
    fireEvent.click(dialog.getByRole("button", { name: "Sembunyikan" }));

    await waitFor(() => {
      const status = screen.getByRole("status");
      expect(status.textContent).toBe("Tulisan ini sudah tidak tersedia di lingkar.");
      expect(document.activeElement).toBe(status);
    });
  });
});
