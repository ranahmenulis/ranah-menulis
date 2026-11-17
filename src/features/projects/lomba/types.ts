/**
 * Contest results (LMB-02, PRD 17.5 "Halaman hasil lomba"). All of it is sample data [konfirmasi]:
 * the real finalists and winners are set by the Organizer after judging (6g), and how scores are
 * combined is Q-28.
 */

/** Where a contest stands, from open for work to winners announced. Derived, never typed in. */
export type ContestStage = "terbuka" | "dinilai" | "finalis" | "pemenang";

/** A work that reached the finalists. `authorId` is a Community author (a profile to link to). */
export type ContestEntry = {
  id: string;
  title: string;
  genre: string;
  authorId: string;
};

/** A winner among the finalists. Equal ranks mean a tie (PRD 17.5, "hasil seri"). */
export type ContestWinner = { entryId: string; rank: number; jurorNote: string };

export type ContestResults = {
  slug: string;
  finalists: ContestEntry[];
  winners: ContestWinner[];
};

/**
 * What the Organizer did to a contest, kept on this device: the furthest stage it was pushed to,
 * and (development only) whether the reader's own work was made a finalist.
 */
export type ContestOverride = {
  stage: ContestStage;
  /** When each announcement was pushed, so an earlier one is not re-dated by a later one. */
  times: Partial<Record<"finalis" | "pemenang", number>>;
  mine?: boolean;
};
export type ContestOverrides = Record<string, ContestOverride>;
