import { ME_ID } from "../fixtures/authors";
import { fixtureComments } from "../fixtures/comments";
import { postsA } from "../fixtures/posts-a";
import { postsB } from "../fixtures/posts-b";
import type { ReportKind } from "./report-store";

/**
 * Who wrote reported content, found from the content itself and never taken from the screen: a
 * fixture has its author, and whatever else is stored on this device was written by the dummy
 * account. The backend answers this from the database.
 */
export function contentAuthor(kind: ReportKind, targetId: string): string {
  const found =
    kind === "post"
      ? [...postsA, ...postsB].find((p) => p.id === targetId)
      : fixtureComments.find((c) => c.id === targetId);
  return found?.authorId ?? ME_ID;
}
