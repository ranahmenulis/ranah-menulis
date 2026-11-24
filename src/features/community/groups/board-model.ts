import type { CircleKind, CircleWords, FinalRow, GroupMember, WritingGroup } from "./group-model";

/**
 * The leaderboard of a Writing Circle (client, 23 November 2026), as pure rules. Days are
 * `yyyy-mm-dd` strings in the writer's own time zone, passed in by the caller: nothing here reads
 * the clock. Only members who opted in are counted, and only words written from their opt-in day.
 */
export const CHALLENGE_DAYS = 45;

const DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

const utc = (day: string) => {
  const [y, m, d] = day.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};

export function isDay(value: string): boolean {
  const match = DAY.exec(value);
  if (!match) return false;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

export function addDays(day: string, days: number): string {
  return new Date(utc(day) + days * 86_400_000).toISOString().slice(0, 10);
}

/** The last day of a challenge that starts on `startsOn`: day one counts, so 44 days later. */
export const challengeEnd = (startsOn: string) => addDays(startsOn, CHALLENGE_DAYS - 1);

export const kindOf = (group: Pick<WritingGroup, "kind">): CircleKind => group.kind ?? "permanent";

export type ChallengeState = "upcoming" | "running" | "finished";

export function challengeState(
  group: Pick<WritingGroup, "kind" | "startsOn" | "endsOn">,
  today: string,
): ChallengeState | null {
  if (kindOf(group) !== "challenge" || !group.startsOn || !group.endsOn) return null;
  if (today < group.startsOn) return "upcoming";
  return today > group.endsOn ? "finished" : "running";
}

/** Whole days left including today; 0 once it is over. */
export function daysLeft(group: Pick<WritingGroup, "endsOn">, today: string): number {
  if (!group.endsOn || today > group.endsOn) return 0;
  return Math.round((utc(group.endsOn) - utc(today)) / 86_400_000) + 1;
}

export type Period = { from: string; to: string };

/** A permanent circle counts the calendar month of `today`; a challenge counts its own dates. */
export function periodOf(
  group: Pick<WritingGroup, "kind" | "startsOn" | "endsOn">,
  today: string,
): Period {
  if (kindOf(group) === "challenge" && group.startsOn && group.endsOn) {
    return { from: group.startsOn, to: group.endsOn };
  }
  const first = `${today.slice(0, 7)}-01`;
  const nextMonth = `${addDays(first, 31).slice(0, 7)}-01`;
  return { from: first, to: addDays(nextMonth, -1) };
}

export type BoardRow = { authorId: string; words: number; rank: number };

/** Counts a member's words inside the period and from their own opt-in day. */
function wordsOf(member: GroupMember, entries: readonly CircleWords[], period: Period): number {
  const from =
    member.boardSince && member.boardSince > period.from ? member.boardSince : period.from;
  return entries
    .filter(
      (e) =>
        e.authorId === member.authorId &&
        e.membershipId === member.membershipId &&
        e.day >= from &&
        e.day <= period.to,
    )
    .reduce((sum, e) => sum + e.words, 0);
}

/** Members who turned the leaderboard on. A member who did not opt in never appears. */
export const boardMembers = (group: Pick<WritingGroup, "members">) =>
  group.members.filter((member) => member.board === true);

/**
 * The live ranking: most words first, equal words share a rank (1, 1, 3), ties ordered by id so the
 * list never shuffles. A finished challenge reads its frozen result instead.
 */
export function boardRows(group: WritingGroup, today: string): BoardRow[] {
  const period = periodOf(group, today);
  const sorted = boardMembers(group)
    .map((member) => ({
      authorId: member.authorId,
      words: wordsOf(member, group.words ?? [], period),
    }))
    .sort((a, b) => b.words - a.words || a.authorId.localeCompare(b.authorId));
  const rows: BoardRow[] = [];
  sorted.forEach((row, i) => {
    const tied = i > 0 && sorted[i - 1].words === row.words;
    rows.push({ ...row, rank: tied ? rows[i - 1].rank : i + 1 });
  });
  return rows;
}

/** All the words of members who opted in, in the current period. */
export const circleTotal = (group: WritingGroup, today: string): number =>
  boardRows(group, today).reduce((sum, row) => sum + row.words, 0);

/**
 * The result of a finished challenge, for storing. A name is kept so the archive stays readable;
 * `nameOf` is the caller's way to find it.
 */
export function freezeBoard(group: WritingGroup, nameOf: (authorId: string) => string): FinalRow[] {
  return boardRows(group, group.endsOn ?? "").map((row) => ({
    authorId: row.authorId,
    name: nameOf(row.authorId),
    words: row.words,
    rank: row.rank,
  }));
}

/** A person who left: the frozen line stays, without their name or identity. */
export const forgetMember = (
  rows: readonly FinalRow[],
  authorId: string,
  anonymous: string,
): FinalRow[] =>
  rows.map((row) =>
    row.authorId === authorId ? { ...row, authorId: null, name: anonymous } : row,
  );

export type CircleDateProblem = "startRequired" | "startInvalid" | "startInPast";

/** A challenge needs a start day that exists and is not in the past. Permanent circles need none. */
export function validateCircleStart(
  kind: CircleKind,
  startsOn: string,
  today: string,
): CircleDateProblem | null {
  if (kind !== "challenge") return null;
  if (startsOn.trim() === "") return "startRequired";
  if (!isDay(startsOn)) return "startInvalid";
  return startsOn < today ? "startInPast" : null;
}
