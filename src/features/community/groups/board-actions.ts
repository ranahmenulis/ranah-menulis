import type { DailyLog } from "@/features/studio/daily-progress";
import { personById } from "@/features/kelola/admin/people";
import { challengeState, freezeBoard, isDay } from "./board-model";
import { mergeOwnWords, ownDays } from "./board-sync";
import {
  changeGroup,
  doneGroup,
  refuseGroup,
  saveGroupChange,
  type GroupResult,
} from "./group-actions";
import { memberOf } from "./group-model";

/**
 * Turns the leaderboard on or off for the reader. Both read the circle and the membership again
 * when the switch is pressed. Turning it off keeps the words already counted but stops showing and
 * counting them; turning it on again starts a fresh `boardSince`.
 */
export function setBoardOptIn(id: string, on: boolean, today: string): GroupResult {
  if (on && !isDay(today)) return refuseGroup("unavailable");
  return changeGroup(id, (group, groups, { authorId }) => {
    const member = memberOf(group, authorId);
    if (!member) return refuseGroup("blocked");
    if ((member.board === true) === on) return doneGroup(on ? "boardOn" : "boardOff");
    const members = group.members.map((item) =>
      item.authorId !== authorId
        ? item
        : on
          ? { ...item, board: true, boardSince: today }
          : { ...item, board: false, boardSince: undefined },
    );
    saveGroupChange(groups, { ...group, members }, authorId);
    return doneGroup(on ? "boardOn" : "boardOff");
  });
}

/**
 * Copies the reader's own daily word counts into the circle. Only for a member who opted in, and
 * only words from the opt-in day. Nothing is written when the rows would not change.
 */
export function syncOwnWords(id: string, history: readonly DailyLog[]): GroupResult {
  return changeGroup(id, (group, groups, { authorId }) => {
    const member = memberOf(group, authorId);
    if (!member || member.board !== true || !member.boardSince) return refuseGroup("blocked");
    const existing = group.words ?? [];
    const words = mergeOwnWords(
      existing,
      member.authorId,
      member.membershipId,
      ownDays(history, member.boardSince),
    );
    if (words === existing) return doneGroup("boardOn");
    saveGroupChange(groups, { ...group, words: [...words] }, authorId);
    return doneGroup("boardOn");
  });
}

/**
 * Stores the result of a challenge once its last day has passed, so the archive no longer depends
 * on live rows. Read again when called; a circle already frozen, or still running, is left alone.
 */
export function freezeFinishedChallenge(id: string, today: string): GroupResult {
  return changeGroup(id, (group, groups, { authorId }) => {
    if (!memberOf(group, authorId)) return refuseGroup("blocked");
    if (challengeState(group, today) !== "finished" || group.finalBoard) {
      return refuseGroup("unavailable");
    }
    const finalBoard = freezeBoard(group, (who) => personById(who)?.name ?? "");
    saveGroupChange(groups, { ...group, finalBoard }, authorId, { action: "group.board.freeze" });
    return doneGroup("boardOn");
  });
}
