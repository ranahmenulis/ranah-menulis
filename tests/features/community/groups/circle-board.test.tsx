import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ME_ID } from "@/features/kelola/identity";
import { CircleBoard } from "@/features/community/groups/components/circle-board";
import { removeGroupMember } from "@/features/community/groups/group-actions";
import type { WritingGroup } from "@/features/community/groups/group-model";
import { writingGroups } from "@/features/community/groups/group-store";

const member = (authorId: string, extra: object = {}) => ({
  authorId,
  membershipId: `m:${authorId}`,
  admin: false,
  ...extra,
});
const words = (authorId: string, day: string, count: number) => ({
  authorId,
  membershipId: `m:${authorId}`,
  day,
  words: count,
});
const circle = (extra: Partial<WritingGroup> = {}): WritingGroup => ({
  id: "c",
  name: "Lingkar",
  description: "",
  visibility: "publik",
  code: "X",
  members: [member(ME_ID), member("hafiz-rahman")],
  invites: [],
  progress: [],
  hiddenPosts: [],
  ...extra,
});

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  writingGroups.reset();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-25T05:00:00Z"));
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  writingGroups.reset();
});

describe("the circle leaderboard", () => {
  it("says so when nobody opted in", async () => {
    render(<CircleBoard group={circle()} reader={ME_ID} />);
    expect(await screen.findByText(/Belum ada anggota yang ikut leaderboard/)).toBeTruthy();
    expect(screen.queryByRole("list", { name: "Peringkat leaderboard" })).toBeNull();
  });

  it("ranks opted-in members, shares a rank on a tie, and labels everyone but the reader as sample", async () => {
    const group = circle({
      members: [
        member(ME_ID, { board: true, boardSince: "2026-11-01" }),
        member("hafiz-rahman", { board: true, boardSince: "2026-11-01" }),
        member("nur-aisyah", { board: true, boardSince: "2026-11-01" }),
      ],
      words: [
        words(ME_ID, "2026-11-10", 500),
        words("hafiz-rahman", "2026-11-10", 500),
        words("nur-aisyah", "2026-11-10", 100),
      ],
    });
    render(<CircleBoard group={group} reader={ME_ID} />);
    const list = await screen.findByRole("list", { name: "Peringkat leaderboard" });
    const ranks = within(list)
      .getAllByLabelText(/^Peringkat \d+$/)
      .map((el) => el.getAttribute("aria-label"));
    expect(ranks).toEqual(["Peringkat 1", "Peringkat 1", "Peringkat 3"]);
    expect(within(list).getAllByText("Contoh")).toHaveLength(2);
    expect(within(list).getAllByText("Kamu")).toHaveLength(1);
  });

  it("leaves out a member who did not opt in, and words from before their opt-in day", async () => {
    const group = circle({
      members: [member(ME_ID, { board: true, boardSince: "2026-11-20" }), member("hafiz-rahman")],
      words: [
        words(ME_ID, "2026-11-10", 900),
        words(ME_ID, "2026-11-21", 40),
        words("hafiz-rahman", "2026-11-21", 700),
      ],
    });
    render(<CircleBoard group={group} reader={ME_ID} />);
    const list = await screen.findByRole("list", { name: "Peringkat leaderboard" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(1);
    expect(within(list).getByText("40 kata")).toBeTruthy();
  });

  it("shows no ranking before a challenge starts", async () => {
    const group = circle({ kind: "challenge", startsOn: "2026-12-01", endsOn: "2027-01-14" });
    render(<CircleBoard group={group} reader={ME_ID} />);
    expect(await screen.findByText(/Tantangan dimulai 1 Desember 2026/)).toBeTruthy();
  });
});

describe("a finished challenge", () => {
  const finished = () =>
    circle({
      id: "tantangan",
      kind: "challenge",
      startsOn: "2026-09-01",
      endsOn: "2026-10-15",
      members: [
        member(ME_ID, { board: true, boardSince: "2026-09-01" }),
        member("hafiz-rahman", { board: true, boardSince: "2026-09-01" }),
      ],
      words: [words(ME_ID, "2026-09-10", 300), words("hafiz-rahman", "2026-09-12", 800)],
    });

  it("freezes its result once and shows the archive", async () => {
    writingGroups.write([finished()]);
    render(<CircleBoard group={writingGroups.read()[0]} reader={ME_ID} />);
    expect(await screen.findByText("Hasil akhir tantangan")).toBeTruthy();
    const stored = writingGroups.read()[0].finalBoard;
    expect(stored?.map((row) => [row.authorId, row.words, row.rank])).toEqual([
      ["hafiz-rahman", 800, 1],
      [ME_ID, 300, 2],
    ]);
  });

  it("keeps a frozen line but forgets who it was when that person leaves", async () => {
    writingGroups.write([finished()]);
    render(<CircleBoard group={writingGroups.read()[0]} reader={ME_ID} />);
    await screen.findByText("Hasil akhir tantangan");
    expect(removeGroupMember("tantangan", ME_ID).ok).toBe(true);
    const rows = writingGroups.read()[0].finalBoard!;
    expect(rows.find((row) => row.words === 300)).toMatchObject({ authorId: null, name: "" });
    cleanup();
    render(<CircleBoard group={writingGroups.read()[0]} reader="hafiz-rahman" />);
    expect(await screen.findByText("Anggota yang keluar")).toBeTruthy();
  });
});
