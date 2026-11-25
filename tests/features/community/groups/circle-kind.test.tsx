import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ME_ID } from "@/features/kelola/identity";
import { auditLog } from "@/features/kelola/audit/audit-log";
import { CircleStats } from "@/features/community/groups/components/circle-stats";
import { GroupSettingsDialog } from "@/features/community/groups/components/group-dialogs";
import { GroupHero } from "@/features/community/groups/components/group-seal";
import { saveGroup } from "@/features/community/groups/group-actions";
import type { WritingGroup } from "@/features/community/groups/group-model";
import { writingGroups } from "@/features/community/groups/group-store";
import { installDialogShim } from "@/test/dialog-shim";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/grup",
  useSearchParams: () => new URLSearchParams(window.location.search),
}));

const base = { name: "Ruang Teduh", description: "", visibility: "privat" as const };
const last = () => writingGroups.read().at(-1)!;

beforeEach(() => {
  installDialogShim();
  sessionStorage.clear();
  localStorage.clear();
  writingGroups.reset();
  auditLog.reset();
});
afterEach(() => {
  cleanup();
  writingGroups.reset();
  auditLog.reset();
});

describe("creating a circle with a kind", () => {
  it("makes a permanent circle without any dates", () => {
    expect(saveGroup(base).ok).toBe(true);
    expect(last().kind).toBeUndefined();
    expect(last().startsOn).toBeUndefined();
  });

  it("makes a challenge that ends on day 45", () => {
    const result = saveGroup(
      { ...base, kind: "challenge", startsOn: "2026-12-01" },
      { today: "2026-11-24" },
    );
    expect(result.ok).toBe(true);
    expect(last()).toMatchObject({
      kind: "challenge",
      startsOn: "2026-12-01",
      endsOn: "2027-01-14",
    });
  });

  it("refuses a challenge without a real start day, or one in the past, and stores nothing", () => {
    const before = writingGroups.read().length;
    const ask = (startsOn: string) =>
      saveGroup({ ...base, kind: "challenge", startsOn }, { today: "2026-11-24" });
    expect(ask("").code).toBe("startRequired");
    expect(ask("2026-02-30").code).toBe("startInvalid");
    expect(ask("2026-11-23").code).toBe("startInPast");
    expect(writingGroups.read()).toHaveLength(before);
  });

  it("never changes the kind or the dates when a circle is edited", () => {
    const id = saveGroup(
      { ...base, kind: "challenge", startsOn: "2026-12-01" },
      { today: "2026-11-24" },
    ).id!;
    const original = { ...base, id };
    const edited = saveGroup(
      { ...base, name: "Nama baru", kind: "permanent", startsOn: "2030-01-01" },
      { original },
    );
    expect(edited.ok).toBe(true);
    expect(last()).toMatchObject({ name: "Nama baru", kind: "challenge", startsOn: "2026-12-01" });
  });
});

describe("the create dialog", () => {
  it("asks for the start day only for a challenge, and says what is wrong with it", () => {
    render(<GroupSettingsDialog onSaved={vi.fn()} onClose={vi.fn()} />);
    expect(screen.queryByLabelText("Tanggal mulai")).toBeNull();
    fireEvent.change(screen.getByLabelText("Nama lingkar"), { target: { value: "Tantangan" } });
    fireEvent.change(screen.getByLabelText("Jenis"), { target: { value: "challenge" } });
    fireEvent.click(screen.getByRole("button", { name: "Buat lingkar" }));
    expect(screen.getByText("Isi tanggal mulai tantangan.")).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText("Tanggal mulai"));
    expect(writingGroups.read().some((g) => g.name === "Tantangan")).toBe(false);
  });

  it("creates the challenge once the start day is filled", () => {
    const saved = vi.fn();
    render(<GroupSettingsDialog onSaved={saved} onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Nama lingkar"), { target: { value: "Tantangan" } });
    fireEvent.change(screen.getByLabelText("Jenis"), { target: { value: "challenge" } });
    const day = new Date(Date.now() + 2 * 86_400_000).toISOString().slice(0, 10);
    fireEvent.change(screen.getByLabelText("Tanggal mulai"), { target: { value: day } });
    fireEvent.click(screen.getByRole("button", { name: "Buat lingkar" }));
    expect(saved).toHaveBeenCalledOnce();
    expect(last()).toMatchObject({ name: "Tantangan", kind: "challenge", startsOn: day });
  });

  it("shows the kind as fixed when editing", () => {
    saveGroup(base);
    render(
      <GroupSettingsDialog
        group={{ ...writingGroups.read()[0] }}
        onSaved={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    const dialog = within(screen.getByRole("dialog"));
    expect(dialog.queryByLabelText("Jenis")).toBeNull();
    expect(dialog.getByText(/tidak bisa diubah setelah lingkar dibuat/)).toBeTruthy();
  });
});

describe("the circle page", () => {
  const challenge: WritingGroup = {
    id: "t",
    name: "Tantangan",
    description: "",
    visibility: "publik",
    code: "X",
    members: [{ authorId: "a", membershipId: "m", admin: true }],
    invites: [],
    progress: [],
    hiddenPosts: [],
    kind: "challenge",
    startsOn: "2000-01-01",
    endsOn: "2000-02-14",
  };

  it("names the kind in the hero", () => {
    render(<GroupHero group={challenge} />);
    expect(screen.getByText("Tantangan 45 Hari")).toBeTruthy();
    cleanup();
    render(<GroupHero group={{ ...challenge, kind: undefined }} />);
    expect(screen.getByText("Lingkar tetap")).toBeTruthy();
  });

  it("summarises a permanent circle by the current month, with no challenge status", async () => {
    render(
      <CircleStats group={{ ...challenge, kind: undefined }} reader={ME_ID} onResult={vi.fn()} />,
    );
    await screen.findByText("Ringkasan lingkar");
    expect(screen.getByText(/bulan berjalan/)).toBeTruthy();
    expect(screen.queryByText("Status")).toBeNull();
    expect(screen.getByText("Total kata").nextSibling?.textContent).toBe("0");
  });

  it("says a challenge in the past is finished", async () => {
    render(<CircleStats group={challenge} reader={ME_ID} onResult={vi.fn()} />);
    await screen.findByText("Ringkasan lingkar");
    expect(screen.getByText("Selesai")).toBeTruthy();
    expect(screen.queryByText("Sisa hari")).toBeNull();
  });
});
